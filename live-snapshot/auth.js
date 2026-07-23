/* ============================================
   Breakout — Auth System (Worker API)
   Email + Password with secure backend
   ============================================ */

const Auth = {
  TOKEN_KEY: 'breakout_token',
  USER_KEY: 'breakout_user',
  ORDERS_KEY: 'artistpush_orders', // legacy (kept for compatibility)
  API: 'https://breakout-api.artistpushnet.workers.dev',

  // ─── Register ───
  async register(name, email, password) {
    if (!name || !email || !password) return { ok: false, error: 'All fields are required.' };
    if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
    try {
      const r = await fetch(this.API + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password })
      });
      const data = await r.json();
      if (!r.ok) return { ok: false, error: data.error || 'Registration failed.' };
      this._setSession(data.token, data.user);
      return { ok: true, user: data.user };
    } catch (e) {
      console.error('Register error:', e);
      return { ok: false, error: 'Network error: ' + (e.message || 'unknown') + '. Check that you are on breakoutmusic.io (CORS).' };
    }
  },

  // ─── Login ───
  async login(email, password) {
    if (!email || !password) return { ok: false, error: 'Email and password are required.' };
    try {
      const r = await fetch(this.API + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      const data = await r.json();
      if (!r.ok) return { ok: false, error: data.error || 'Invalid email or password.' };
      this._setSession(data.token, data.user);
      return { ok: true, user: data.user };
    } catch (e) {
      console.error('Login error:', e);
      return { ok: false, error: 'Network error: ' + (e.message || 'unknown') };
    }
  },

  // ─── Forgot Password ───
  async forgotPassword(email) {
    if (!email) return { ok: false, error: 'Email is required.' };
    try {
      const r = await fetch(this.API + '/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      if (!r.ok) return { ok: false, error: 'Request failed.' };
      return { ok: true };
    } catch (e) { return { ok: false, error: 'Network error.' }; }
  },

  // ─── Reset Password (from email link) ───
  async resetPassword(email, token, newPassword) {
    if (!email || !token || !newPassword) return { ok: false, error: 'Missing fields.' };
    if (newPassword.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
    try {
      const r = await fetch(this.API + '/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), token, newPassword })
      });
      const data = await r.json();
      if (!r.ok) return { ok: false, error: data.error || 'Reset failed.' };
      return { ok: true };
    } catch (e) { return { ok: false, error: 'Network error.' }; }
  },

  // ─── Change Password (logged-in) ───
  async changePassword(currentPassword, newPassword) {
    const token = this.getToken();
    if (!token) return { ok: false, error: 'Not logged in.' };
    if (newPassword.length < 8) return { ok: false, error: 'New password must be at least 8 characters.' };
    try {
      const r = await fetch(this.API + '/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await r.json();
      if (!r.ok) return { ok: false, error: data.error || 'Change failed.' };
      return { ok: true };
    } catch (e) { return { ok: false, error: 'Network error.' }; }
  },

  // ─── Logout ───
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._updateAuthUI();
  },

  // ─── Session getters ───
  getUser() {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY) || 'null'); }
    catch { return null; }
  },
  getToken() { return localStorage.getItem(this.TOKEN_KEY); },
  isLoggedIn() { return !!(this.getToken() && this.getUser()); },

  // ─── Validate session against server ───
  async refreshUser() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const r = await fetch(this.API + '/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!r.ok) { this.logout(); return null; }
      const data = await r.json();
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
      this._updateAuthUI();
      return data.user;
    } catch { return null; }
  },

  // ─── Update profile (placeholder for future API) ───
  async updateProfile(_data) {
    return { ok: false, error: 'Profile editing coming soon.' };
  },

  // ─── Orders (legacy localStorage stub; real orders are in D1 via /api/orders) ───
  getOrders() { return []; },
  saveOrder(_items, _total) { return false; },

  // ─── Internals ───
  _setSession(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._updateAuthUI();
  },

  _updateAuthUI() {
    const user = this.getUser();
    const icons = document.querySelectorAll('.auth-trigger');
    icons.forEach(icon => {
      if (user) { icon.classList.add('logged-in'); icon.setAttribute('title', user.name || user.email); }
      else { icon.classList.remove('logged-in'); icon.setAttribute('title', 'Account'); }
    });
  },

  init() {
    this._updateAuthUI();
    if (this.getToken()) this.refreshUser();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Auth.init());
} else { Auth.init(); }
