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
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ─── API: Get publishable key ───
app.get('/api/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// ─── API: Create Payment Intent ───
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { items, email } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // ─── Calculate total from items ───
    // In production, ALWAYS calculate price server-side from your product catalog
    // Never trust client-sent prices
    let totalAmount = 0;
    const itemDescriptions = [];

    for (const item of items) {
      // Validate item structure
      if (!item.name || !item.price || !item.quantity) {
        return res.status(400).json({ error: 'Invalid item structure' });
      }

      // Price is in dollars, convert to cents
      const itemTotal = Math.round(item.price * 100) * item.quantity;
      totalAmount += itemTotal;
      itemDescriptions.push(`${item.quantity}x ${item.name}`);
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
    console.error('Error creating Payment Intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── API: Get order status ───
app.get('/api/order-status/:paymentIntentId', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.paymentIntentId);
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
