export function buildOrderEmailHtml(orderNumber, email, items, totalAmount, currency) {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:12px 16px;color:#e0e0e0;font-size:14px;border-bottom:1px solid #1e1e1e;">
        ${item.serviceType}${item.serviceVariant ? ' \u00b7 ' + item.serviceVariant : ''}
      </td>
      <td style="padding:12px 16px;color:#e0e0e0;font-size:14px;text-align:center;border-bottom:1px solid #1e1e1e;">
        ${item.quantity}
      </td>
      <td style="padding:12px 16px;color:#e0e0e0;font-size:14px;text-align:right;border-bottom:1px solid #1e1e1e;">
        $${(item.quantity * item.unitPrice).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="padding:24px 0;text-align:center;">
    <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">Breakout</span>
  </td></tr>
  <tr><td style="background:#0f0f0f;border-radius:16px;border:1px solid #1e1e1e;overflow:hidden;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:32px 32px 16px;text-align:center;">
        <div style="width:56px;height:56px;background:rgba(0,255,133,0.15);border-radius:50%;margin:0 auto 16px;line-height:56px;font-size:28px;color:#00FF85;">&#10003;</div>
        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Order Confirmed</h1>
        <p style="margin:8px 0 0;color:#b0b0b0;font-size:14px;">We're on it. Delivery starts within 1&ndash;2 business days.</p>
      </td></tr>
      <tr><td style="padding:16px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:10px;border:1px solid #1e1e1e;">
          <tr>
            <td style="padding:14px 16px;color:#b0b0b0;font-size:13px;">Order</td>
            <td style="padding:14px 16px;color:#00FF85;font-size:14px;font-weight:600;text-align:right;font-family:monospace;">${orderNumber}</td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="padding:8px 32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <th style="padding:10px 16px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;text-align:left;border-bottom:1px solid #1e1e1e;">Item</th>
            <th style="padding:10px 16px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;text-align:center;border-bottom:1px solid #1e1e1e;">Qty</th>
            <th style="padding:10px 16px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;text-align:right;border-bottom:1px solid #1e1e1e;">Price</th>
          </tr>
          ${itemRows}
        </table>
      </td></tr>
      <tr><td style="padding:0 32px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:10px;border:1px solid #1e1e1e;">
          <tr>
            <td style="padding:16px;color:#fff;font-size:15px;font-weight:600;">Total</td>
            <td style="padding:16px;color:#00FF85;font-size:18px;font-weight:700;text-align:right;">$${totalAmount.toFixed(2)} ${currency}</td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="padding:0 32px 24px;text-align:center;">
        <a href="https://breakoutmusic.io/account.html" style="display:inline-block;background:#00FF85;color:#000;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">Track Your Order</a>
      </td></tr>
      <tr><td style="padding:0 32px;">
        <div style="height:1px;background:linear-gradient(90deg,transparent,#1e1e1e,transparent);"></div>
      </td></tr>
      <tr><td style="padding:24px 32px;text-align:center;">
        <p style="margin:0 0 4px;color:#b0b0b0;font-size:13px;">Your next order deserves a boost</p>
        <p style="margin:0 0 12px;color:#fff;font-size:18px;font-weight:700;">5% OFF</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;background:#141414;border:1px dashed #00FF85;border-radius:8px;">
          <tr><td style="padding:10px 24px;color:#00FF85;font-size:16px;font-weight:700;font-family:monospace;letter-spacing:2px;">NEXT5</td></tr>
        </table>
        <p style="margin:8px 0 0;color:#999;font-size:12px;">Valid for 30 days on any service</p>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:24px 0;text-align:center;">
    <p style="margin:0 0 8px;color:#999;font-size:12px;">Questions? <a href="mailto:hello@breakoutmusic.io" style="color:#00FF85;text-decoration:none;">breakoutmusicsupport@gmail.com</a></p>
    <p style="margin:0;color:#666;font-size:11px;">&copy; 2026 Breakout. Estonia, EU.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

export async function sendOrderConfirmationEmail(env, email, orderNumber, items, totalAmount, currency) {
  console.log('EMAIL_FUNC_CALLED', email, orderNumber);
  if (!env.BREVO_API_KEY) { console.warn('BREVO_API_KEY_NOT_SET'); return; }
  console.log('BREVO_KEY_EXISTS');
  const html = buildOrderEmailHtml(orderNumber, email, items, totalAmount, currency);
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Jay Finn', email: 'hello@breakoutmusic.io' },
        to: [{ email }],
        subject: 'Order Confirmed \u2014 ' + orderNumber,
        htmlContent: html,
      }),
    });
    const body = await res.text();
    console.log('BREVO_RESPONSE', res.status, body);
  } catch (err) {
    console.error('EMAIL_ERROR', err.message);
  }
}