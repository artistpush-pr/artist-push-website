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
  const allowed = origin === allowedOrigin || origin === 'http://localhost:3000';
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

// Simple auth check for admin routes
function isAuthorized(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  return auth.slice(7) === env.ADMIN_PASSWORD;
}

export default {
  async fetch(request, env) {
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
      if (path === '/api/orders' && method === 'POST') {
        const body = await request.json();
        const { email, name, items } = body;

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

        // Create order
        const orderNumber = generateOrderNumber();
        const orderResult = await env.DB.prepare(
          `INSERT INTO orders (customer_id, order_number, total_amount, currency)
           VALUES (?, ?, ?, ?)`
        ).bind(customer.id, orderNumber, totalAmount, body.currency || 'USD').run();

        const orderId = orderResult.meta.last_row_id;

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

      // === ADMIN ROUTES (require auth) ===

      if (path.startsWith('/api/admin')) {
        if (!isAuthorized(request, env)) {
          return json({ error: 'Unauthorized' }, 401, cors);
        }

        // Admin: List orders
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

        // Admin: Update order status
        if (path.match(/^\/api\/admin\/orders\/\d+$/) && method === 'PUT') {
          const orderId = path.split('/').pop();
          const body = await request.json();

          const updates = [];
          const values = [];

          if (body.status) { updates.push('status = ?'); values.push(body.status); }
          if (body.payment_status) { updates.push('payment_status = ?'); values.push(body.payment_status); }
          if (body.notes !== undefined) { updates.push('notes = ?'); values.push(body.notes); }

          if (updates.length === 0) return json({ error: 'No fields to update' }, 400, cors);

          updates.push("updated_at = datetime('now')");
          values.push(orderId);

          await env.DB.prepare(
            `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`
          ).bind(...values).run();

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
