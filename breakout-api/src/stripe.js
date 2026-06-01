/* ============================================================================
 * Breakout — Stripe helpers (Cloudflare Worker compatible)
 * ----------------------------------------------------------------------------
 * Uses the Stripe REST API directly via fetch — no SDK dependency, no Node.js
 * built-ins, works inside Workers. Signature verification uses Web Crypto API.
 *
 * Env requirements:
 *   env.STRIPE_SECRET_KEY     — sk_test_... or sk_live_...
 *   env.STRIPE_WEBHOOK_SECRET — whsec_... (signature verification secret)
 * ============================================================================ */

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

/**
 * Create a Checkout Session for a single one-off payment.
 *
 * @param {object} env — Worker env (must contain STRIPE_SECRET_KEY)
 * @param {object} opts
 *   - orderId         (number)  internal D1 row id
 *   - orderNumber     (string)  e.g. "BRK-1023"
 *   - customerEmail   (string)
 *   - items           (array)   [{ platform, serviceType, serviceVariant, quantity, unitPrice, targetUrl }]
 *   - currency        (string)  e.g. "USD"
 *   - promoDiscount   (number)  flat amount in dollars (optional)
 *   - successUrl      (string)  full URL the user lands on after payment
 *   - cancelUrl       (string)  full URL if user clicks "← Back"
 *   - expiresAt       (number)  optional Unix timestamp; defaults to 30 days
 * @returns {Promise<{ id, url, payment_intent, expires_at, ... }>}
 */
export async function createStripeCheckoutSession(env, opts) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not set in env');
  }

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('customer_email', opts.customerEmail);
  params.append('success_url', opts.successUrl);
  params.append('cancel_url', opts.cancelUrl);

  // Max 30-day expiry (Stripe enforces a hard cap of ~30 days)
  const expiresAt = opts.expiresAt || (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);
  params.append('expires_at', String(expiresAt));

  // Line items
  const currency = (opts.currency || 'USD').toLowerCase();
  opts.items.forEach((item, i) => {
    const name = [item.platform, item.serviceType, item.serviceVariant]
      .filter(Boolean)
      .join(' — '); // em-dash separator
    params.append(`line_items[${i}][price_data][currency]`, currency);
    params.append(`line_items[${i}][price_data][unit_amount]`, String(Math.round(item.unitPrice * 100)));
    params.append(`line_items[${i}][price_data][product_data][name]`, name);
    if (item.targetUrl) {
      params.append(`line_items[${i}][price_data][product_data][description]`, `Track: ${item.targetUrl}`);
    }
    if (item.platform) {
      params.append(`line_items[${i}][price_data][product_data][metadata][platform]`, item.platform);
    }
    params.append(`line_items[${i}][quantity]`, String(item.quantity));
  });

  // Apply promo discount as a Stripe coupon (one-time, percent or fixed)
  if (opts.promoDiscount && opts.promoDiscount > 0) {
    // Create a one-off Stripe coupon for this discount amount.
    // (We could pre-create coupons, but it's simpler to make them ad-hoc.)
    const coupon = await stripeCreateCoupon(env, {
      amount_off: Math.round(opts.promoDiscount * 100),
      currency: currency,
      duration: 'once',
      name: opts.promoCode ? `Discount (${opts.promoCode})` : 'Discount',
    });
    if (coupon && coupon.id) {
      params.append('discounts[0][coupon]', coupon.id);
    }
  }

  // Metadata so the webhook can find the order
  params.append('metadata[order_id]', String(opts.orderId));
  params.append('metadata[order_number]', opts.orderNumber);
  params.append('payment_intent_data[metadata][order_id]', String(opts.orderId));
  params.append('payment_intent_data[metadata][order_number]', opts.orderNumber);
  params.append('payment_intent_data[description]', `Breakout order ${opts.orderNumber}`);

  // Save card optionally? — keep it simple, no off-session re-use for now.

  const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const session = await res.json();
  if (!res.ok) {
    console.error('STRIPE_SESSION_CREATE_FAILED', JSON.stringify(session));
    throw new Error('Stripe API error: ' + (session.error?.message || res.status));
  }
  return session;
}

/**
 * Create a one-off coupon (used for promo-code discounts on Checkout).
 */
async function stripeCreateCoupon(env, opts) {
  const params = new URLSearchParams();
  if (opts.amount_off) {
    params.append('amount_off', String(opts.amount_off));
    params.append('currency', opts.currency || 'usd');
  } else if (opts.percent_off) {
    params.append('percent_off', String(opts.percent_off));
  }
  params.append('duration', opts.duration || 'once');
  if (opts.name) params.append('name', opts.name);
  params.append('max_redemptions', '1'); // one-time use only

  const res = await fetch(`${STRIPE_API_BASE}/coupons`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  const coupon = await res.json();
  if (!res.ok) {
    console.error('STRIPE_COUPON_CREATE_FAILED', JSON.stringify(coupon));
    return null;
  }
  return coupon;
}

/**
 * Look up an existing Checkout Session (used by webhook + admin resend).
 */
export async function retrieveStripeSession(env, sessionId) {
  const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions/${sessionId}`, {
    headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` },
  });
  return res.ok ? await res.json() : null;
}

/**
 * Verify a Stripe webhook signature using Web Crypto.
 *
 * Returns the parsed event object if valid, null otherwise.
 * Stripe signature header format:
 *   t=<unix-seconds>,v1=<hex-hmac-sha256>
 */
export async function verifyStripeSignature(payload, sigHeader, secret, toleranceSeconds = 300) {
  if (!sigHeader || !secret) return null;

  const parts = sigHeader.split(',').map(p => p.trim());
  const tsPart = parts.find(p => p.startsWith('t='));
  const v1Part = parts.find(p => p.startsWith('v1='));
  if (!tsPart || !v1Part) return null;

  const timestamp = tsPart.slice(2);
  const expectedSig = v1Part.slice(3);

  // Reject events older than tolerance (replay protection)
  const ageSeconds = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  if (isNaN(ageSeconds) || ageSeconds < -60 || ageSeconds > toleranceSeconds) return null;

  // HMAC-SHA256 over "timestamp.payload"
  const encoder = new TextEncoder();
  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const sigHex = Array.from(new Uint8Array(sigBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time compare
  if (sigHex.length !== expectedSig.length) return null;
  let mismatch = 0;
  for (let i = 0; i < sigHex.length; i++) {
    mismatch |= sigHex.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  if (mismatch !== 0) return null;

  try {
    return JSON.parse(payload);
  } catch (err) {
    console.error('STRIPE_WEBHOOK_PARSE_ERROR', err.message);
    return null;
  }
}
