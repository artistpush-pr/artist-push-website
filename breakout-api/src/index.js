import { sendOrderConfirmationEmail, sendPayPalInstructionsEmail, sendPasswordResetEmail, sendStripePaymentEmail } from './email.js';
import { createStripeCheckoutSession, verifyStripeSignature, retrieveStripeSession } from './stripe.js';
import { handleRegister, handleLogin, handleMe, handleForgotPassword, handleResetPassword, handleChangePassword, hashPassword, verifyPassword } from './auth.js';
/**
 * Breakout Music API — Cloudflare Worker
 * Handles orders, customers, subscribers, and admin endpoints
 */

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BRK-${ts}-${rand}`;
}

function corsHeaders(origin, allowedOrigin) {
  const allowed = origin === allowedOrigin
    || origin === 'http://localhost:3000'
    || (origin && /^https:\/\/[a-z0-9-]+\.breakout-music-io\.pages\.dev$/.test(origin))
    || (origin && /^https:\/\/[a-z0-9-]+\.pages\.dev$/.test(origin) && origin.includes('breakout'));
  return {
    'Access-Control-Allow-Origin': allowed ? origin : allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status = 200, cors = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

// Admin auth — checks DB first, falls back to env.ADMIN_PASSWORD if no hash set
async function isAuthorized(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const password = auth.slice(7);

  // Check D1 settings table for hash
  try {
    const hashRow = await env.DB.prepare(
      "SELECT value FROM settings WHERE key = 'admin_password_hash'"
    ).first();
    if (hashRow && hashRow.value) {
      const saltRow = await env.DB.prepare(
        "SELECT value FROM settings WHERE key = 'admin_password_salt'"
      ).first();
      if (saltRow && saltRow.value) {
        return await verifyPassword(password, hashRow.value, saltRow.value);
      }
    }
  } catch (e) {
    console.warn('Admin auth DB check failed, falling back to env:', e.message);
  }

  // Fallback to env (initial setup before first password change)
  return password === env.ADMIN_PASSWORD;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env.CORS_ORIGIN);

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      // === PUBLIC ROUTES ===

      // Health check
      if (path === '/api/health' && method === 'GET') {
        return json({ status: 'ok', timestamp: new Date().toISOString() }, 200, cors);
      }

      // Create order (from checkout)
      // Public: validate promo code (also checks min_items rule)
      if (path === '/api/promo/validate' && method === 'GET') {
        const code = url.searchParams.get('code') || '';
        const itemsCount = parseInt(url.searchParams.get('items') || '0', 10);
        if (!code.trim()) return json({ valid: false, error: 'Empty code' }, 400, cors);
        const promo = await env.DB.prepare(
          `SELECT code, discount_percent, COALESCE(min_items, 1) as min_items FROM promo_codes
           WHERE LOWER(code) = LOWER(?) AND active = 1
             AND (expires_at IS NULL OR expires_at > datetime('now'))`
        ).bind(code.trim()).first();
        if (!promo) return json({ valid: false }, 200, cors);
        if (itemsCount > 0 && itemsCount < promo.min_items) {
          return json({ valid: false, error: `This code requires at least ${promo.min_items} items in your cart.`, minItems: promo.min_items }, 200, cors);
        }
        return json({ valid: true, code: promo.code, discountPercent: promo.discount_percent, minItems: promo.min_items }, 200, cors);
      }

      // Public: capture/update abandoned checkout snapshot
      if (path === '/api/checkout/abandon' && method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const { email, items, subtotal, promoCode } = body;
        if (!email || !items || !items.length) return json({ ok: false }, 200, cors);
        const itemsJson = JSON.stringify(items);
        await env.DB.prepare(
          `INSERT INTO abandoned_checkouts (email, items_json, subtotal, promo_code)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(email) DO UPDATE SET
             items_json = excluded.items_json,
             subtotal = excluded.subtotal,
             promo_code = excluded.promo_code,
             updated_at = datetime('now'),
             recovered = CASE WHEN recovered = 1 THEN 1 ELSE 0 END`
        ).bind(email.trim().toLowerCase(), itemsJson, subtotal || 0, promoCode || null).run();
        return json({ ok: true }, 200, cors);
      }

      // ────────────────────────────────────────────────────────────────────
      // POST /api/webhooks/stripe
      // Stripe sends events here when payment status changes.
      // We verify the signature with STRIPE_WEBHOOK_SECRET, then mark the
      // associated order as Paid + fire the Google Sheets sync (same as the
      // existing admin manual-mark-paid path).
      // ────────────────────────────────────────────────────────────────────
      if (path === '/api/webhooks/stripe' && method === 'POST') {
        const sig = request.headers.get('stripe-signature');
        const rawBody = await request.text();

        const event = await verifyStripeSignature(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
        if (!event) {
          console.warn('STRIPE_WEBHOOK_INVALID_SIG', sig?.slice(0, 30));
          return new Response('Invalid signature', { status: 400 });
        }

        console.log('STRIPE_WEBHOOK', event.type, event.id);

        try {
          // ── checkout.session.completed → mark order Paid ──────────────
          if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const orderId = parseInt(session.metadata?.order_id, 10);
            const orderNumber = session.metadata?.order_number;
            if (!orderId) {
              console.warn('STRIPE_WEBHOOK_NO_ORDER_ID', session.id);
              return new Response('ok', { status: 200 });
            }

            // Check if we've already processed this (idempotency)
            const current = await env.DB.prepare(
              'SELECT id, payment_status, customer_id FROM orders WHERE id = ?'
            ).bind(orderId).first();
            if (!current) {
              console.warn('STRIPE_WEBHOOK_ORDER_NOT_FOUND', orderId);
              return new Response('ok', { status: 200 });
            }
            if (current.payment_status === 'paid') {
              console.log('STRIPE_WEBHOOK_ALREADY_PAID', orderId);
              return new Response('ok', { status: 200 });
            }

            // Mark Paid + store payment intent
            await env.DB.prepare(
              `UPDATE orders
                  SET payment_status = 'paid',
                      status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END,
                      stripe_payment_intent = COALESCE(?, stripe_payment_intent),
                      updated_at = datetime('now')
                WHERE id = ?`
            ).bind(session.payment_intent || null, orderId).run();

            // Fire Google Sheets sync (same as admin manual-paid path)
            if (env.SHEETS_WEBHOOK_URL) {
              ctx.waitUntil((async () => {
                try {
                  const order = await env.DB.prepare(
                    `SELECT o.order_number, o.created_at, c.email
                       FROM orders o JOIN customers c ON o.customer_id = c.id
                      WHERE o.id = ?`
                  ).bind(orderId).first();
                  const itemsResult = await env.DB.prepare(
                    `SELECT platform, service_type, service_variant, quantity, target_url
                       FROM order_items WHERE order_id = ?`
                  ).bind(orderId).all();
                  const itemsForSheet = (itemsResult.results || []).map(i => ({
                    platform: i.platform, serviceType: i.service_type,
                    serviceVariant: i.service_variant, quantity: i.quantity, targetUrl: i.target_url,
                  }));
                  const resp = await fetch(env.SHEETS_WEBHOOK_URL, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      orderNumber: order.order_number,
                      date: (order.created_at || '').slice(0, 10),
                      email: order.email,
                      items: itemsForSheet,
                      paymentMethod: 'stripe',
                    }),
                  });
                  console.log('SHEETS_WEBHOOK_SENT_STRIPE', order.order_number, resp.status);
                } catch (e) {
                  console.error('SHEETS_WEBHOOK_ERROR_STRIPE', e.message);
                }
              })());
            }

            return new Response('ok', { status: 200 });
          }

          // ── charge.refunded → mark order Refunded ─────────────────────
          if (event.type === 'charge.refunded' || event.type === 'charge.refund.updated') {
            const charge = event.data.object;
            const paymentIntentId = charge.payment_intent;
            if (paymentIntentId) {
              await env.DB.prepare(
                `UPDATE orders SET payment_status = 'refunded', updated_at = datetime('now')
                  WHERE stripe_payment_intent = ?`
              ).bind(paymentIntentId).run();
              console.log('STRIPE_WEBHOOK_REFUND_APPLIED', paymentIntentId);
            }
            return new Response('ok', { status: 200 });
          }

          // ── payment_intent.payment_failed → log, leave order pending ───
          if (event.type === 'payment_intent.payment_failed') {
            const intent = event.data.object;
            console.log('STRIPE_WEBHOOK_PAYMENT_FAILED',
              intent.id, intent.last_payment_error?.message);
            return new Response('ok', { status: 200 });
          }

          // Unhandled event — just ack so Stripe doesn't retry
          return new Response('ok', { status: 200 });
        } catch (err) {
          console.error('STRIPE_WEBHOOK_HANDLER_ERROR', err.message);
          // 500 → Stripe will retry
          return new Response('handler error', { status: 500 });
        }
      }

      // ────────────────────────────────────────────────────────────────────
      // POST /api/admin/orders/:id/resend-payment-email
      // Admin clicks "Resend payment email" — for Stripe orders where the
      // session has expired (30-day cap) or the customer lost the email.
      // If existing session is still valid → resend same URL.
      // If expired/missing → create a fresh session, persist, then email.
      // ────────────────────────────────────────────────────────────────────
      if (path.match(/^\/api\/admin\/orders\/(\d+)\/resend-payment-email$/) && method === 'POST') {
        if (!(await isAuthorized(request, env))) {
          return json({ error: 'Unauthorized' }, 401, cors);
        }
        const orderId = parseInt(path.split('/')[4], 10);

        // Load order + customer
        const order = await env.DB.prepare(
          `SELECT o.*, c.email AS customer_email, c.name AS customer_name
             FROM orders o JOIN customers c ON o.customer_id = c.id
            WHERE o.id = ?`
        ).bind(orderId).first();
        if (!order) return json({ error: 'Order not found' }, 404, cors);
        if (order.payment_method !== 'stripe') {
          return json({ error: 'This order is not a Stripe order' }, 400, cors);
        }
        if (order.payment_status === 'paid') {
          return json({ error: 'Order already paid' }, 400, cors);
        }

        // Load items
        const itemsResult = await env.DB.prepare(
          `SELECT platform, service_type, service_variant, quantity, unit_price, total_price, target_url
             FROM order_items WHERE order_id = ?`
        ).bind(orderId).all();
        const items = (itemsResult.results || []).map(i => ({
          platform: i.platform, serviceType: i.service_type, serviceVariant: i.service_variant,
          quantity: i.quantity, unitPrice: i.unit_price, totalPrice: i.total_price,
          targetUrl: i.target_url,
        }));

        // Decide whether to reuse existing session or create a new one
        let stripeUrl = null;
        let sessionId = order.stripe_session_id;

        if (sessionId) {
          const existing = await retrieveStripeSession(env, sessionId);
          // Stripe Checkout Session statuses: open / complete / expired
          if (existing && existing.status === 'open' && existing.url) {
            stripeUrl = existing.url;
          }
        }

        if (!stripeUrl) {
          // Make a new session
          try {
            const siteOrigin = env.SITE_ORIGIN || 'https://breakoutmusic.io';
            const newSession = await createStripeCheckoutSession(env, {
              orderId,
              orderNumber: order.order_number,
              customerEmail: order.customer_email,
              items,
              currency: order.currency || 'USD',
              successUrl: `${siteOrigin}/success?order=${encodeURIComponent(order.order_number)}&session_id={CHECKOUT_SESSION_ID}`,
              cancelUrl:  `${siteOrigin}/checkout?order=${encodeURIComponent(order.order_number)}&canceled=1`,
            });
            stripeUrl  = newSession.url;
            sessionId  = newSession.id;
            await env.DB.prepare(
              `UPDATE orders SET stripe_session_id = ?, stripe_payment_url = ?,
                                 stripe_payment_intent = ?,
                                 stripe_session_expires_at = ?,
                                 updated_at = datetime('now')
               WHERE id = ?`
            ).bind(
              newSession.id,
              newSession.url,
              newSession.payment_intent || null,
              newSession.expires_at ? new Date(newSession.expires_at * 1000).toISOString() : null,
              orderId
            ).run();
          } catch (err) {
            console.error('STRIPE_RESEND_REGEN_FAILED', err.message);
            return json({ error: 'Failed to create new Stripe session: ' + err.message }, 500, cors);
          }
        }

        // Send the email
        ctx.waitUntil(sendStripePaymentEmail(env, {
          customerEmail: order.customer_email,
          orderNumber: order.order_number,
          createdAt: new Date(order.created_at || Date.now()).toLocaleDateString('en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }),
          items,
          subtotal: items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0),
          total: order.total_amount,
          currencySymbol: (order.currency || 'USD') === 'USD' ? '$' : (order.currency + ' '),
          stripePaymentUrl: stripeUrl,
        }));

        return json({ ok: true, sessionId, paymentUrl: stripeUrl }, 200, cors);
      }

      if (path === '/api/orders' && method === 'POST') {
        const body = await request.json();
        const { email, name, items, paymentMethod, promoCode } = body;

        if (!email || !items || !items.length) {
          return json({ error: 'Email and items are required' }, 400, cors);
        }

        // Upsert customer
        await env.DB.prepare(
          `INSERT INTO customers (email, name) VALUES (?, ?)
           ON CONFLICT(email) DO UPDATE SET name = COALESCE(?, name), updated_at = datetime('now')`
        ).bind(email, name || null, name || null).run();

        const customer = await env.DB.prepare(
          'SELECT id FROM customers WHERE email = ?'
        ).bind(email).first();

        // Calculate total
        let totalAmount = 0;
        for (const item of items) {
          totalAmount += item.quantity * item.unitPrice;
        }


        // Validate promo code and apply discount if valid
        let appliedPromoCode = null;
        let promoDiscountPercent = 0;
        let promoDiscountAmount = 0;
        if (promoCode) {
          const promo = await env.DB.prepare(
            `SELECT code, discount_percent, COALESCE(min_items, 1) as min_items FROM promo_codes
             WHERE LOWER(code) = LOWER(?) AND active = 1
               AND (expires_at IS NULL OR expires_at > datetime('now'))`
          ).bind(promoCode.trim()).first();
          if (promo && items.length >= promo.min_items) {
            promoDiscountPercent = promo.discount_percent;
            promoDiscountAmount = Math.round(totalAmount * promoDiscountPercent) / 100;
            appliedPromoCode = promo.code;
            totalAmount = Math.max(0, totalAmount - promoDiscountAmount);
          }
        }

        // Create order with TEMP number, then assign sequential BRK-{1000+id}
        const tempNumber = 'TEMP-' + Date.now();
        const orderResult = await env.DB.prepare(
          `INSERT INTO orders (customer_id, order_number, total_amount, currency, payment_method)
           VALUES (?, ?, ?, ?, ?)`
        ).bind(customer.id, tempNumber, totalAmount, body.currency || 'USD', paymentMethod || 'stripe').run();
        const orderNumber = `BRK-${1000 + orderResult.meta.last_row_id}`;
        await env.DB.prepare('UPDATE orders SET order_number = ? WHERE id = ?').bind(orderNumber, orderResult.meta.last_row_id).run();

        const orderId = orderResult.meta.last_row_id;


        // Track promo usage in promo_codes table
        if (appliedPromoCode) {
          await env.DB.prepare(
            `UPDATE promo_codes SET uses_count = uses_count + 1, total_discount_given = total_discount_given + ? WHERE LOWER(code) = LOWER(?)`
          ).bind(promoDiscountAmount, appliedPromoCode).run();
        }

        // Insert order items
        for (const item of items) {
          await env.DB.prepare(
            `INSERT INTO order_items (order_id, platform, service_type, service_variant, quantity, unit_price, total_price, target_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            orderId,
            item.platform,
            item.serviceType,
            item.serviceVariant || null,
            item.quantity,
            item.unitPrice,
            item.quantity * item.unitPrice,
            item.targetUrl || null
          ).run();
        }

        // Mark any abandoned checkout for this email as recovered
        await env.DB.prepare(
          `UPDATE abandoned_checkouts
           SET recovered = 1, recovered_at = datetime('now'), recovered_order_number = ?
           WHERE LOWER(email) = LOWER(?) AND recovered = 0`
        ).bind(orderNumber, email).run();

        // ─── Branch on payment method ───
        console.log("ABOUT_TO_SEND_EMAIL", email, orderNumber, paymentMethod);

        if (paymentMethod === 'stripe') {
          // Create Stripe Checkout Session synchronously so we can store + email the URL
          try {
            const siteOrigin = env.SITE_ORIGIN || 'https://breakoutmusic.io';
            const session = await createStripeCheckoutSession(env, {
              orderId,
              orderNumber,
              customerEmail: email,
              items: items.map(i => ({
                platform: i.platform, serviceType: i.serviceType, serviceVariant: i.serviceVariant,
                quantity: i.quantity, unitPrice: i.unitPrice, targetUrl: i.targetUrl,
              })),
              currency: body.currency || 'USD',
              promoDiscount: promoDiscountAmount,
              promoCode: appliedPromoCode,
              successUrl: `${siteOrigin}/success?order=${encodeURIComponent(orderNumber)}&session_id={CHECKOUT_SESSION_ID}`,
              cancelUrl:  `${siteOrigin}/checkout?order=${encodeURIComponent(orderNumber)}&canceled=1`,
            });

            // Persist Stripe session info on the order
            await env.DB.prepare(
              `UPDATE orders SET stripe_session_id = ?, stripe_payment_url = ?, stripe_payment_intent = ?,
                                 stripe_session_expires_at = ?
               WHERE id = ?`
            ).bind(
              session.id,
              session.url,
              session.payment_intent || null,
              session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
              orderId
            ).run();

            // Send the Stripe payment email (with the big Pay button)
            ctx.waitUntil(sendStripePaymentEmail(env, {
              customerEmail: email,
              orderNumber,
              createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              items: items.map(i => ({
                platform: i.platform, serviceType: i.serviceType, serviceVariant: i.serviceVariant,
                quantity: i.quantity, unitPrice: i.unitPrice, targetUrl: i.targetUrl,
                totalPrice: i.unitPrice * i.quantity,
              })),
              subtotal: items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0),
              promoCode: appliedPromoCode,
              promoDiscount: promoDiscountAmount || 0,
              total: totalAmount,
              currencySymbol: (body.currency || 'USD') === 'USD' ? '$' : (body.currency + ' '),
              stripePaymentUrl: session.url,
            }));

            return json({
              success: true,
              order: { id: orderId, orderNumber, totalAmount, currency: body.currency || 'USD' },
              stripe: { sessionId: session.id, paymentUrl: session.url },
            }, 201, cors);
          } catch (err) {
            console.error('STRIPE_SESSION_FAILED', err.message);
            // Don't fail the order — fall through to a generic confirmation email so the
            // customer at least knows we got the order; admin can resend payment later.
            ctx.waitUntil(sendOrderConfirmationEmail(env, email, orderNumber, items, totalAmount, body.currency || 'USD'));
            return json({
              success: true,
              order: { id: orderId, orderNumber, totalAmount, currency: body.currency || 'USD' },
              stripe: { error: 'Could not create Stripe payment session. Our team will contact you with payment instructions.' },
            }, 201, cors);
          }
        }

        // PayPal or generic — existing behaviour
        const _emailFn = paymentMethod === 'paypal' ? sendPayPalInstructionsEmail : sendOrderConfirmationEmail;
        ctx.waitUntil(_emailFn(env, email, orderNumber, items, totalAmount, body.currency || 'USD'));

        return json({
          success: true,
          order: { id: orderId, orderNumber, totalAmount, currency: body.currency || 'USD' }
        }, 201, cors);
      }

      // Get order by number (for success/tracking page)
      if (path.startsWith('/api/orders/') && method === 'GET' && !path.includes('/admin')) {
        const orderNumber = path.split('/api/orders/')[1];
        const order = await env.DB.prepare(
          `SELECT o.*, c.email, c.name as customer_name
           FROM orders o JOIN customers c ON o.customer_id = c.id
           WHERE o.order_number = ?`
        ).bind(orderNumber).first();

        if (!order) return json({ error: 'Order not found' }, 404, cors);

        const items = await env.DB.prepare(
          'SELECT * FROM order_items WHERE order_id = ?'
        ).bind(order.id).all();

        return json({ order: { ...order, items: items.results } }, 200, cors);
      }

      // Subscribe to email list
      if (path === '/api/subscribe' && method === 'POST') {
        const body = await request.json();
        if (!body.email) return json({ error: 'Email is required' }, 400, cors);

        await env.DB.prepare(
          `INSERT INTO subscribers (email, name, source) VALUES (?, ?, ?)
           ON CONFLICT(email) DO UPDATE SET subscribed = 1, name = COALESCE(?, name)`
        ).bind(body.email, body.name || null, body.source || 'website', body.name || null).run();

        return json({ success: true, message: 'Subscribed successfully' }, 201, cors);
      }

      // Unsubscribe
      if (path === '/api/unsubscribe' && method === 'POST') {
        const body = await request.json();
        if (!body.email) return json({ error: 'Email is required' }, 400, cors);

        await env.DB.prepare(
          'UPDATE subscribers SET subscribed = 0 WHERE email = ?'
        ).bind(body.email).run();

        return json({ success: true, message: 'Unsubscribed' }, 200, cors);
      }

      // === AUTH ROUTES ===
      if (path === '/api/auth/register' && method === 'POST')        return handleRegister(request, env, cors);
      if (path === '/api/auth/login' && method === 'POST')           return handleLogin(request, env, cors);
      if (path === '/api/auth/me' && method === 'GET')               return handleMe(request, env, cors);
      if (path === '/api/auth/forgot-password' && method === 'POST') return handleForgotPassword(request, env, ctx, cors);
      if (path === '/api/auth/reset-password' && method === 'POST')  return handleResetPassword(request, env, cors);
      if (path === '/api/auth/change-password' && method === 'POST') return handleChangePassword(request, env, cors);

      // === ADMIN ROUTES (require auth) ===

      if (path.startsWith('/api/admin')) {
        if (!(await isAuthorized(request, env))) {
          return json({ error: 'Unauthorized' }, 401, cors);
        }

        // Admin: Change own password (saves hash to D1 settings)
        if (path === '/api/admin/change-password' && method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const { currentPassword, newPassword } = body;
          if (!currentPassword || !newPassword) {
            return json({ error: 'Both passwords required.' }, 400, cors);
          }
          if (newPassword.length < 8) {
            return json({ error: 'New password must be at least 8 characters.' }, 400, cors);
          }
          if (currentPassword === newPassword) {
            return json({ error: 'New password must differ from current.' }, 400, cors);
          }
          // Re-verify current (was already accepted by isAuthorized, but double-check)
          const headerPw = request.headers.get('Authorization').slice(7);
          if (headerPw !== currentPassword) {
            return json({ error: 'Current password mismatch.' }, 401, cors);
          }
          const { hash, salt } = await hashPassword(newPassword);
          await env.DB.prepare(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('admin_password_hash', ?, datetime('now'))"
          ).bind(hash).run();
          await env.DB.prepare(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('admin_password_salt', ?, datetime('now'))"
          ).bind(salt).run();
          return json({ success: true }, 200, cors);
        }

        // Admin: list abandoned checkouts
        if (path === '/api/admin/abandoned-checkouts' && method === 'GET') {
          const filter = url.searchParams.get('filter') || 'all';
          const days = parseInt(url.searchParams.get('days') || '30', 10);
          let where = `created_at >= datetime('now', '-${days} days')`;
          if (filter === 'recovered') where += ' AND recovered = 1';
          if (filter === 'open') where += ' AND recovered = 0';
          const rows = await env.DB.prepare(
            `SELECT id, email, items_json, subtotal, promo_code, recovered, recovered_at, recovered_order_number, email_sent_at, created_at, updated_at
             FROM abandoned_checkouts WHERE ${where} ORDER BY updated_at DESC LIMIT 200`
          ).all();
          const items = (rows.results || []).map(r => ({ ...r, items: r.items_json ? JSON.parse(r.items_json) : [] }));
          return json({ abandoned: items }, 200, cors);
        }

        // Admin: List orders
        if (path === '/api/admin/analytics' && method === 'GET') {
          const period = url.searchParams.get('period') || '30';
          const days = parseInt(period, 10) || 30;
          const sinceClause = `o.created_at >= datetime('now', '-${days} days')`;

          const [ordersStats, revenueStats, promoStats, topProducts] = await Promise.all([
            env.DB.prepare(`SELECT COUNT(*) as count FROM orders o WHERE ${sinceClause}`).first(),
            env.DB.prepare(`SELECT
                COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount END), 0) as paid_revenue,
                COALESCE(SUM(CASE WHEN payment_status = 'unpaid' THEN total_amount END), 0) as pending_revenue,
                COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_count,
                COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid_count,
                COALESCE(AVG(CASE WHEN payment_status = 'paid' THEN total_amount END), 0) as aov
              FROM orders o WHERE ${sinceClause}`).first(),
            env.DB.prepare(`SELECT code, discount_percent, uses_count, total_discount_given, active FROM promo_codes ORDER BY uses_count DESC`).all(),
            env.DB.prepare(`SELECT oi.service_type, oi.platform, COUNT(*) as orders, SUM(oi.quantity) as units, SUM(oi.total_price) as revenue
              FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE ${sinceClause}
              GROUP BY oi.service_type, oi.platform ORDER BY revenue DESC LIMIT 10`).all(),
          ]);

          return json({
            period: days,
            orders_count: ordersStats.count,
            paid_revenue: revenueStats.paid_revenue,
            pending_revenue: revenueStats.pending_revenue,
            paid_count: revenueStats.paid_count,
            unpaid_count: revenueStats.unpaid_count,
            aov: revenueStats.aov,
            promo_codes: promoStats.results,
            top_products: topProducts.results,
          }, 200, cors);
        }

        if (path === '/api/admin/orders' && method === 'GET') {
          const status = url.searchParams.get('status');
          const page = parseInt(url.searchParams.get('page') || '1');
          const limit = parseInt(url.searchParams.get('limit') || '50');
          const offset = (page - 1) * limit;

          let query = `SELECT o.*, c.email, c.name as customer_name
                       FROM orders o JOIN customers c ON o.customer_id = c.id`;
          let countQuery = 'SELECT COUNT(*) as total FROM orders o';
          const params = [];

          if (status) {
            query += ' WHERE o.status = ?';
            countQuery += ' WHERE o.status = ?';
            params.push(status);
          }

          query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';

          const [orders, count] = await Promise.all([
            env.DB.prepare(query).bind(...params, limit, offset).all(),
            env.DB.prepare(countQuery).bind(...params).first(),
          ]);

          return json({
            orders: orders.results,
            pagination: { page, limit, total: count.total, pages: Math.ceil(count.total / limit) }
          }, 200, cors);
        }

        // Admin: Get single order with items
        if (path.match(/^\/api\/admin\/orders\/\d+$/) && method === 'GET') {
          const orderId = path.split('/').pop();
          const order = await env.DB.prepare(
            `SELECT o.*, c.email, c.name as customer_name
             FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ?`
          ).bind(orderId).first();

          if (!order) return json({ error: 'Order not found' }, 404, cors);

          const items = await env.DB.prepare(
            'SELECT * FROM order_items WHERE order_id = ?'
          ).bind(orderId).all();

          return json({ order: { ...order, items: items.results } }, 200, cors);
        }

        // Admin: Update order status (+ Sheets webhook on paid transition)
        if (path.match(/^\/api\/admin\/orders\/\d+$/) && method === 'PUT') {
          const orderId = path.split('/').pop();
          const body = await request.json();

          // Get current state to detect transitions
          const currentOrder = await env.DB.prepare(
            'SELECT payment_status FROM orders WHERE id = ?'
          ).bind(orderId).first();
          if (!currentOrder) return json({ error: 'Order not found' }, 404, cors);

          const updates = [];
          const values = [];

          if (body.status) { updates.push('status = ?'); values.push(body.status); }
          if (body.payment_status) { updates.push('payment_status = ?'); values.push(body.payment_status); }
          if (body.fulfillment_status) { updates.push('fulfillment_status = ?'); values.push(body.fulfillment_status); }
          if (body.notes !== undefined) { updates.push('notes = ?'); values.push(body.notes); }

          if (updates.length === 0) return json({ error: 'No fields to update' }, 400, cors);

          updates.push("updated_at = datetime('now')");
          values.push(orderId);

          await env.DB.prepare(
            `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`
          ).bind(...values).run();

          // Fire Google Sheets webhook ONLY on transition unpaid → paid
          if (body.payment_status === 'paid' && currentOrder.payment_status !== 'paid' && env.SHEETS_WEBHOOK_URL) {
            ctx.waitUntil((async () => {
              try {
                const order = await env.DB.prepare(
                  `SELECT o.order_number, o.created_at, c.email
                   FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ?`
                ).bind(orderId).first();
                const itemsResult = await env.DB.prepare(
                  'SELECT platform, service_type, service_variant, quantity, target_url FROM order_items WHERE order_id = ?'
                ).bind(orderId).all();
                const items = (itemsResult.results || []).map(i => ({
                  platform: i.platform,
                  serviceType: i.service_type,
                  serviceVariant: i.service_variant,
                  quantity: i.quantity,
                  targetUrl: i.target_url,
                }));
                const resp = await fetch(env.SHEETS_WEBHOOK_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderNumber: order.order_number,
                    date: (order.created_at || '').slice(0, 10),
                    email: order.email,
                    items: items,
                  }),
                });
                console.log('SHEETS_WEBHOOK_SENT', order.order_number, resp.status);
              } catch (e) {
                console.error('SHEETS_WEBHOOK_ERROR', e.message);
              }
            })());
          }

          return json({ success: true }, 200, cors);
        }

        // Admin: List customers
        if (path === '/api/admin/customers' && method === 'GET') {
          const page = parseInt(url.searchParams.get('page') || '1');
          const limit = parseInt(url.searchParams.get('limit') || '50');
          const offset = (page - 1) * limit;

          const [customers, count] = await Promise.all([
            env.DB.prepare(
              `SELECT c.*, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
               FROM customers c LEFT JOIN orders o ON c.id = o.customer_id
               GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`
            ).bind(limit, offset).all(),
            env.DB.prepare('SELECT COUNT(*) as total FROM customers').first(),
          ]);

          return json({
            customers: customers.results,
            pagination: { page, limit, total: count.total, pages: Math.ceil(count.total / limit) }
          }, 200, cors);
        }

        // Admin: List subscribers
        if (path === '/api/admin/subscribers' && method === 'GET') {
          const subscribers = await env.DB.prepare(
            'SELECT * FROM subscribers ORDER BY created_at DESC'
          ).all();
          return json({ subscribers: subscribers.results }, 200, cors);
        }

        // Admin: Dashboard stats
        if (path === '/api/admin/stats' && method === 'GET') {
          const [totalOrders, revenue, pendingOrders, totalCustomers, totalSubscribers] = await Promise.all([
            env.DB.prepare('SELECT COUNT(*) as count FROM orders').first(),
            env.DB.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid'").first(),
            env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").first(),
            env.DB.prepare('SELECT COUNT(*) as count FROM customers').first(),
            env.DB.prepare('SELECT COUNT(*) as count FROM subscribers WHERE subscribed = 1').first(),
          ]);

          const recentOrders = await env.DB.prepare(
            `SELECT o.*, c.email FROM orders o JOIN customers c ON o.customer_id = c.id
             ORDER BY o.created_at DESC LIMIT 10`
          ).all();

          return json({
            stats: {
              totalOrders: totalOrders.count,
              revenue: revenue.total,
              pendingOrders: pendingOrders.count,
              totalCustomers: totalCustomers.count,
              totalSubscribers: totalSubscribers.count,
            },
            recentOrders: recentOrders.results,
          }, 200, cors);
        }
      }

      // 404
      return json({ error: 'Not found' }, 404, cors);

    } catch (err) {
      console.error('API Error:', err);
      return json({ error: 'Internal server error', message: err.message }, 500, cors);
    }
  },
};
