/* ============================================
   Artist Push — Express + Stripe Server
   ============================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security: Trust proxy (for rate limiting behind reverse proxy) ───
app.set('trust proxy', 1);

// ─── Security: Simple in-memory rate limiter (no extra dependency) ───
const rateLimitMap = new Map();
function rateLimit(windowMs, maxRequests) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }

    const requests = rateLimitMap.get(ip).filter(t => t > windowStart);
    rateLimitMap.set(ip, requests);

    if (requests.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    requests.push(now);
    next();
  };
}

// Clean up rate limit map every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 900000;
  for (const [ip, times] of rateLimitMap) {
    const filtered = times.filter(t => t > cutoff);
    if (filtered.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, filtered);
  }
}, 300000);

// ─── Stripe Webhook (must be BEFORE express.json()) ───
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ─── Handle event types ───
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
      console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}`);
      console.log(`   Customer email: ${paymentIntent.receipt_email || paymentIntent.metadata.email || 'N/A'}`);
      console.log(`   Order items: ${paymentIntent.metadata.items || 'N/A'}`);

      // TODO: Fulfill the order
      // - Send confirmation email
      // - Create order in your database
      // - Start promotion campaign
      // - Update order status
      break;
    }

    case 'payment_intent.payment_failed': {
      const failedIntent = event.data.object;
      console.log(`❌ Payment failed: ${failedIntent.id}`);
      console.log(`   Error: ${failedIntent.last_payment_error?.message || 'Unknown'}`);

      // TODO: Notify the customer
      // - Send failure email
      // - Log for review
      break;
    }

    case 'payment_intent.created': {
      console.log(`🆕 Payment Intent created: ${event.data.object.id}`);
      break;
    }

    case 'charge.succeeded': {
      const charge = event.data.object;
      console.log(`💳 Charge succeeded: ${charge.id} — $${(charge.amount / 100).toFixed(2)}`);
      break;
    }

    case 'charge.refunded': {
      const refund = event.data.object;
      console.log(`↩️  Charge refunded: ${refund.id} — $${(refund.amount_refunded / 100).toFixed(2)}`);

      // TODO: Handle refund
      // - Update order status
      // - Pause/cancel promotion campaign
      break;
    }

    default:
      console.log(`ℹ️  Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// ─── Middleware ───

// Security: CORS — restrict to your domain(s)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true,
}));

// Security: Limit request body size
app.use(express.json({ limit: '10kb' }));

// Security: Set security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Security: Serve only the public folder (NOT root with .env)
app.use(express.static(path.join(__dirname, 'public')));

// ─── API: Get publishable key ───
app.get('/api/config', rateLimit(60000, 30), (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// ─── Email validation helper ───
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

// ─── API: Create Payment Intent ───
app.post('/api/create-payment-intent', rateLimit(60000, 10), async (req, res) => {
  try {
    const { items, email } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({ error: 'Invalid items' });
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // ─── Calculate total from items ───
    // In production, ALWAYS calculate price server-side from your product catalog
    // Never trust client-sent prices
    let totalAmount = 0;
    const itemDescriptions = [];

    for (const item of items) {
      // Validate item structure and types
      if (!item.name || typeof item.name !== 'string' || item.name.length > 200) {
        return res.status(400).json({ error: 'Invalid item name' });
      }
      if (typeof item.price !== 'number' || item.price <= 0 || item.price > 10000) {
        return res.status(400).json({ error: 'Invalid item price' });
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
        return res.status(400).json({ error: 'Invalid item quantity' });
      }

      // Sanitize item name (strip HTML)
      const safeName = item.name.replace(/<[^>]*>/g, '').trim();

      // Price is in dollars, convert to cents
      const itemTotal = Math.round(item.price * 100) * item.quantity;
      totalAmount += itemTotal;
      itemDescriptions.push(`${item.quantity}x ${safeName}`);
    }

    // Minimum charge: $0.50 (Stripe minimum)
    if (totalAmount < 50) {
      return res.status(400).json({ error: 'Minimum order amount is $0.50' });
    }

    // ─── Create Payment Intent ───
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: itemDescriptions.join(', '),
        email: email || '',
        item_count: items.length.toString(),
      },
      receipt_email: email || undefined,
      description: `Artist Push order: ${itemDescriptions.join(', ')}`,
    });

    console.log(`🛒 Created Payment Intent: ${paymentIntent.id} — $${(totalAmount / 100).toFixed(2)}`);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
    });

  } catch (error) {
    console.error('Error creating Payment Intent:', error.message);
    res.status(500).json({ error: 'Payment processing failed. Please try again.' });
  }
});

// ─── API: Get order status ───
app.get('/api/order-status/:paymentIntentId', rateLimit(60000, 20), async (req, res) => {
  try {
    // Validate paymentIntentId format
    const id = req.params.paymentIntentId;
    if (!id || !/^pi_[a-zA-Z0-9]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    console.error('Error retrieving order status:', error.message);
    res.status(500).json({ error: 'Could not retrieve order status' });
  }
});

// ─── HTML page routes ───
const pages = ['index', 'spotify', 'soundcloud', 'cart', 'checkout', 'success'];
pages.forEach(page => {
  app.get(`/${page === 'index' ? '' : page}`, (req, res) => {
    res.sendFile(path.join(__dirname, `${page}.html`));
  });
});

// ─── Start server ───
app.listen(PORT, () => {
  console.log(`\n🎵 Artist Push server running at http://localhost:${PORT}`);
  console.log(`   Stripe mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? '🔴 LIVE' : '🟡 TEST'}\n`);
});
