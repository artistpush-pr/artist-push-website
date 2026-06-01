/**
 * Breakout — Auth Handlers
 * PBKDF2 password hashing (Web Crypto), HS256 JWT sessions,
 * email-based password reset with hashed tokens.
 */
import { sendPasswordResetEmail } from './email.js';

const PBKDF2_ITERATIONS = 100000;
const JWT_EXPIRY_DAYS = 30;
const RESET_TOKEN_EXPIRY_HOURS = 1;

// ---------- base64url ----------
function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function b64urlDecode(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4;
  if (pad) s += '='.repeat(4 - pad);
  return new Uint8Array(atob(s).split('').map(c => c.charCodeAt(0)));
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', ...cors }
  });
}

function validatePassword(pw) {
  if (typeof pw !== 'string') return 'Password is required.';
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (pw.length > 100) return 'Password too long.';
  return null;
}
function validateEmail(email) {
  if (typeof email !== 'string' || !email.trim()) return 'Email is required.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Invalid email.';
  return null;
}

// ---------- password hashing (PBKDF2-SHA256) ----------
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, key, 256
  );
  return { hash: b64url(hash), salt: b64url(salt) };
}
export async function verifyPassword(password, storedHash, storedSalt) {
  try {
    const salt = b64urlDecode(storedSalt);
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const hash = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, key, 256
    );
    const computed = b64url(hash);
    if (computed.length !== storedHash.length) return false;
    let mismatch = 0;
    for (let i = 0; i < computed.length; i++) mismatch |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
    return mismatch === 0;
  } catch { return false; }
}

// ---------- JWT (HS256) ----------
async function signJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const data = b64url(new TextEncoder().encode(JSON.stringify(header))) + '.' +
               b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return data + '.' + b64url(sig);
}
async function verifyJWT(token, secret) {
  try {
    const [h, b, s] = token.split('.');
    if (!h || !b || !s) return null;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('HMAC', key, b64urlDecode(s),
      new TextEncoder().encode(h + '.' + b));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(b)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

export async function getUserFromRequest(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const payload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
  if (!payload || !payload.userId) return null;
  return await env.DB.prepare(
    'SELECT id, email, name, created_at FROM users WHERE id = ?'
  ).bind(payload.userId).first();
}

// ---------- reset tokens ----------
function generateResetToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function hashResetToken(token) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============== HANDLERS ==============

export async function handleRegister(request, env, cors) {
  if (!env.JWT_SECRET) return json({ error: 'Server not configured (JWT_SECRET missing).' }, 500, cors);
  const body = await request.json().catch(() => ({}));
  const { email, password, name } = body;
  const eErr = validateEmail(email); if (eErr) return json({ error: eErr }, 400, cors);
  const pErr = validatePassword(password); if (pErr) return json({ error: pErr }, 400, cors);

  const cleanEmail = email.trim().toLowerCase();
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(cleanEmail).first();
  if (existing) return json({ error: 'An account with this email already exists.' }, 409, cors);

  const { hash, salt } = await hashPassword(password);
  const result = await env.DB.prepare(
    'INSERT INTO users (email, name, password_hash, password_salt) VALUES (?, ?, ?, ?)'
  ).bind(cleanEmail, name?.trim() || null, hash, salt).run();
  const userId = result.meta.last_row_id;

  const token = await signJWT(
    { userId, email: cleanEmail, exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_DAYS * 86400 },
    env.JWT_SECRET
  );
  return json({ success: true, token, user: { id: userId, email: cleanEmail, name: name?.trim() || null } }, 201, cors);
}

export async function handleLogin(request, env, cors) {
  if (!env.JWT_SECRET) return json({ error: 'Server not configured.' }, 500, cors);
  const body = await request.json().catch(() => ({}));
  const { email, password } = body;
  if (!email || !password) return json({ error: 'Email and password are required.' }, 400, cors);

  const cleanEmail = email.trim().toLowerCase();
  const user = await env.DB.prepare(
    'SELECT id, email, name, password_hash, password_salt FROM users WHERE email = ?'
  ).bind(cleanEmail).first();
  if (!user) return json({ error: 'Invalid email or password.' }, 401, cors);

  const valid = await verifyPassword(password, user.password_hash, user.password_salt);
  if (!valid) return json({ error: 'Invalid email or password.' }, 401, cors);

  const token = await signJWT(
    { userId: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_DAYS * 86400 },
    env.JWT_SECRET
  );
  return json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } }, 200, cors);
}

export async function handleMe(request, env, cors) {
  const user = await getUserFromRequest(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401, cors);
  return json({ user }, 200, cors);
}

export async function handleForgotPassword(request, env, ctx, cors) {
  const body = await request.json().catch(() => ({}));
  const { email } = body;
  if (!email) return json({ error: 'Email is required.' }, 400, cors);
  const cleanEmail = email.trim().toLowerCase();

  const user = await env.DB.prepare(
    'SELECT id, email, name FROM users WHERE email = ?'
  ).bind(cleanEmail).first();

  // Always respond success so attackers cannot enumerate emails
  if (!user) return json({ success: true }, 200, cors);

  // Invalidate previous unused tokens
  await env.DB.prepare(
    "UPDATE password_resets SET used_at = datetime('now') WHERE user_id = ? AND used_at IS NULL"
  ).bind(user.id).run();

  const rawToken = generateResetToken();
  const tokenHash = await hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 3600 * 1000)
    .toISOString().replace('T', ' ').slice(0, 19);

  await env.DB.prepare(
    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)'
  ).bind(user.id, tokenHash, expiresAt).run();

  const resetUrl = 'https://breakoutmusic.io/reset-password.html?token=' + rawToken +
                   '&email=' + encodeURIComponent(user.email);
  ctx.waitUntil(sendPasswordResetEmail(env, user.email, user.name, resetUrl));

  return json({ success: true }, 200, cors);
}

export async function handleResetPassword(request, env, cors) {
  const body = await request.json().catch(() => ({}));
  const { email, token, newPassword } = body;
  if (!email || !token || !newPassword) return json({ error: 'Missing fields.' }, 400, cors);

  const pErr = validatePassword(newPassword);
  if (pErr) return json({ error: pErr }, 400, cors);

  const cleanEmail = email.trim().toLowerCase();
  const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(cleanEmail).first();
  if (!user) return json({ error: 'Invalid or expired reset link.' }, 400, cors);

  const tokenHash = await hashResetToken(token);
  const reset = await env.DB.prepare(
    'SELECT id, expires_at, used_at FROM password_resets WHERE user_id = ? AND token_hash = ?'
  ).bind(user.id, tokenHash).first();

  if (!reset) return json({ error: 'Invalid or expired reset link.' }, 400, cors);
  if (reset.used_at) return json({ error: 'This reset link has already been used.' }, 400, cors);
  if (new Date(reset.expires_at + 'Z') < new Date()) return json({ error: 'This reset link has expired.' }, 400, cors);

  const { hash, salt } = await hashPassword(newPassword);
  await env.DB.prepare(
    "UPDATE users SET password_hash = ?, password_salt = ?, password_changed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
  ).bind(hash, salt, user.id).run();
  await env.DB.prepare(
    "UPDATE password_resets SET used_at = datetime('now') WHERE id = ?"
  ).bind(reset.id).run();

  return json({ success: true }, 200, cors);
}

export async function handleChangePassword(request, env, cors) {
  const user = await getUserFromRequest(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401, cors);
  const body = await request.json().catch(() => ({}));
  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) return json({ error: 'Both passwords required.' }, 400, cors);
  const pErr = validatePassword(newPassword); if (pErr) return json({ error: pErr }, 400, cors);
  if (currentPassword === newPassword) return json({ error: 'New password must differ from current.' }, 400, cors);

  const row = await env.DB.prepare(
    'SELECT password_hash, password_salt FROM users WHERE id = ?'
  ).bind(user.id).first();
  const valid = await verifyPassword(currentPassword, row.password_hash, row.password_salt);
  if (!valid) return json({ error: 'Current password is incorrect.' }, 401, cors);

  const { hash, salt } = await hashPassword(newPassword);
  await env.DB.prepare(
    "UPDATE users SET password_hash = ?, password_salt = ?, password_changed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
  ).bind(hash, salt, user.id).run();

  return json({ success: true }, 200, cors);
}
