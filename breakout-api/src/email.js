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

// ============================================================
// PayPal Manual Payment — Instructions email (F&F flow)
// ============================================================
export function buildPayPalEmailHtml(orderNumber, email, items, totalAmount, currency) {
  const PAYPAL_EMAIL = 'yana_grishkina@ukr.net';
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">
        ${item.serviceType}${item.serviceVariant ? ' \u00b7 ' + item.serviceVariant : ''}
        <span style="color:#64748b;"> \u00d7 ${item.quantity}</span>
      </td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#0f172a;">
        $${(item.quantity * item.unitPrice).toFixed(2)}
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Breakout \u2014 Pay via PayPal</title></head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding:24px 12px">
<table cellpadding="0" cellspacing="0" width="640" style="max-width:640px;width:100%;">
<tr><td style="background:#fff;border-radius:18px;padding:28px;">
  <div style="text-align:center"><strong style="font-size:22px;color:#1ed760;">Breakout</strong><br><br>
    <span style="display:inline-block;padding:8px 14px;border:1px solid #e2e8f0;border-radius:999px;font-size:13px;color:#0f172a;">Order <strong>#${orderNumber}</strong></span></div>
  <div style="border-top:1px solid #e2e8f0;margin:24px 0;"></div>
  <p style="text-align:center;color:#64748b;font-size:15px;line-height:1.6;margin:0;">Please complete your order by sending the payment via PayPal as described below.</p>
  <div style="text-align:center;margin-top:14px">
    <h1 style="font-size:36px;font-weight:900;margin:0;color:#0f172a;">Pay via PayPal</h1>
    <p style="color:#64748b;margin-top:8px;font-size:15px;">Friends &amp; Family only \u00b7 No notes</p>
    <p style="font-size:20px;font-weight:900;margin-top:10px;color:#0f172a;">Total: $${totalAmount.toFixed(2)}</p>
  </div>
  <div style="border-top:1px solid #e2e8f0;margin:24px 0;"></div>
  <div style="text-align:center">
    <a href="https://www.paypal.com/myaccount/transfer/send" target="_blank" style="display:inline-block;padding:14px 26px;border-radius:14px;font-size:16px;font-weight:900;color:#fff;background:#1ed760;background:linear-gradient(90deg,#1ed760 0%,#00c878 50%,#00b377 100%);text-decoration:none;box-shadow:0 10px 24px rgba(30,215,96,0.28);">Pay via PayPal</a>
    <p style="color:#64748b;margin-top:14px;font-size:14px;">Recipient: <strong style="color:#0f172a;">${PAYPAL_EMAIL}</strong></p>
  </div>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-top:22px;padding:18px;">
    <strong style="color:#0f172a;font-size:15px;">Quick steps</strong>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:10px;">
      <tr><td valign="top" width="28" style="padding:6px 0;font-weight:900;color:#1ed760;">1.</td><td valign="top" style="padding:6px 0;font-size:14px;color:#0f172a;line-height:1.55;">Open <strong>PayPal</strong></td></tr>
      <tr><td valign="top" width="28" style="padding:6px 0;font-weight:900;color:#1ed760;">2.</td><td valign="top" style="padding:6px 0;font-size:14px;color:#0f172a;line-height:1.55;">Send the payment to <strong>${PAYPAL_EMAIL}</strong> as <strong>Friends &amp; Family</strong>, not Goods &amp; Services</td></tr>
      <tr><td valign="top" width="28" style="padding:6px 0;font-weight:900;color:#1ed760;">3.</td><td valign="top" style="padding:6px 0;font-size:14px;color:#0f172a;line-height:1.55;">Leave the note field <strong>empty</strong> \u2014 no order numbers, descriptions, or details</td></tr>
    </table>
  </div>
  <p style="color:#64748b;margin-top:16px;font-size:14px;line-height:1.6;">After payment, reply to this email with your <strong>PayPal transaction link or ID</strong> and your order number: <strong style="color:#0f172a;">#${orderNumber}</strong>. We will manually confirm your payment and start your campaign within 24 hours.</p>
  <p style="color:#64748b;font-size:13px;line-height:1.5;">Note: payments sent outside these instructions may be automatically refunded.</p>
  <div style="border-top:1px solid #e2e8f0;margin:24px 0;"></div>
  <div style="text-align:center"><strong style="font-size:18px;color:#0f172a;">Order details</strong></div>
  <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:16px;">${itemRows}</table>
  <table cellspacing="0" width="100%" cellpadding="0" style="margin-top:14px">
    <tr><td style="padding-top:10px;font-weight:900;font-size:16px;color:#0f172a;">Total</td><td align="right" style="padding-top:10px;font-weight:900;font-size:18px;color:#1ed760;">$${totalAmount.toFixed(2)}</td></tr>
  </table>
</td></tr>
<tr><td align="center" style="font-size:12.5px;color:#94a3b8;padding:18px 12px;line-height:1.6;">
  <strong style="color:#475569;font-size:14px;">Breakout</strong><br>
  Pudisoo k\u00fcla, M\u00e4nnim\u00e4e/1, Kuusalu vald, Harju maakond, 74626, Estonia<br>
  <a href="mailto:breakoutmusic@gmail.com" style="color:#94a3b8;">breakoutmusic@gmail.com</a><br>
  &copy; 2026 Breakout \u00b7 All rights reserved
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export async function sendPayPalInstructionsEmail(env, email, orderNumber, items, totalAmount, currency) {
  console.log('PAYPAL_EMAIL_FUNC_CALLED', email, orderNumber);
  if (!env.BREVO_API_KEY) { console.warn('BREVO_API_KEY_NOT_SET'); return; }
  const html = buildPayPalEmailHtml(orderNumber, email, items, totalAmount, currency);
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Breakout', email: 'hello@breakoutmusic.io' },
        to: [{ email }],
        subject: 'Order #' + orderNumber + ' \u2014 complete payment via PayPal',
        htmlContent: html,
      }),
    });
    const body = await res.text();
    console.log('PAYPAL_BREVO_RESPONSE', res.status, body);
  } catch (err) {
    console.error('PAYPAL_EMAIL_ERROR', err.message);
  }
}


// ============================================================
// Password reset email
// ============================================================
export function buildPasswordResetHtml(name, resetUrl) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding:32px 12px">
<table cellpadding="0" cellspacing="0" width="560" style="max-width:560px;width:100%;">
<tr><td style="background:#fff;border-radius:18px;padding:32px;text-align:center;">
  <strong style="font-size:22px;color:#1ed760;">Breakout</strong>
  <h1 style="margin:24px 0 12px;font-size:24px;color:#0f172a;">Reset your password</h1>
  <p style="margin:0 0 22px;color:#64748b;font-size:15px;line-height:1.6;">${name ? 'Hi ' + name + ',' : 'Hi,'} we received a request to reset the password for your Breakout account. Click the button below to set a new password. This link expires in 1 hour.</p>
  <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:14px;font-size:16px;font-weight:900;color:#fff;background:linear-gradient(90deg,#1ed760 0%,#00b377 100%);text-decoration:none;box-shadow:0 10px 24px rgba(30,215,96,0.28);">Reset password</a>
  <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5;">Or copy and paste this URL into your browser:<br><a href="${resetUrl}" style="color:#1ed760;word-break:break-all;">${resetUrl}</a></p>
  <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0;">
  <p style="margin:0;color:#94a3b8;font-size:12.5px;line-height:1.55;">If you didn't request a password reset, you can safely ignore this email \u2014 your password will not be changed.</p>
</td></tr>
<tr><td align="center" style="font-size:12px;color:#94a3b8;padding:18px 12px;line-height:1.6;">
  <strong style="color:#475569;font-size:13px;">Breakout</strong> \u00b7 Estonia, EU<br>
  <a href="mailto:breakoutmusic@gmail.com" style="color:#94a3b8;">breakoutmusic@gmail.com</a>
</td></tr></table></td></tr></table></body></html>`;
}

export async function sendPasswordResetEmail(env, email, name, resetUrl) {
  if (!env.BREVO_API_KEY) { console.warn('BREVO_API_KEY_NOT_SET'); return; }
  const html = buildPasswordResetHtml(name, resetUrl);
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Breakout', email: 'hello@breakoutmusic.io' },
        to: [{ email }],
        subject: 'Reset your Breakout password',
        htmlContent: html,
      }),
    });
    console.log('PWRESET_BREVO_RESPONSE', res.status);
  } catch (err) {
    console.error('PWRESET_EMAIL_ERROR', err.message);
  }
}


// ============================================================
// Stripe payment instructions email
// ------------------------------------------------------------
// Sent automatically when a customer selects "Stripe" at checkout.
// Includes a big "Pay $X.XX" button linking to the Stripe-hosted
// Checkout Session URL (valid 30 days). On payment, Stripe sends
// a webhook -> we auto-mark the order Paid.
// ============================================================
export function buildStripePaymentEmailHtml(opts) {
  // opts: { orderNumber, createdAt, customerEmail, items, subtotal, taxPrice,
  //          taxRate, billingCountryName, vatReverseCharge, customerVatId,
  //          promoCode, promoDiscount, total, currencySymbol, stripePaymentUrl }
  const cs = opts.currencySymbol || '$';
  const fmt = (n) => (Math.round(Number(n) * 100) / 100).toFixed(2);

  // Line items rows
  const itemsHtml = (opts.items || []).map(it => {
    const linePrice = it.totalPrice != null
      ? it.totalPrice
      : (it.unitPrice ? it.unitPrice * (it.quantity || 1) : 0);
    const title = [it.platform, it.serviceType, it.serviceVariant].filter(Boolean).join(' \u2014 ')
      || it.title || 'Service';
    const trackLink = it.targetUrl || it.target_url;
    return `
      <tr><td style="padding:14px 0;border-top:1px solid #e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-size:15px;font-weight:700;color:#0f172a;">
            ${escapeHtml(title)}
            <div style="font-size:13px;color:#64748b;font-weight:400;margin-top:2px;">Qty ${it.quantity || 1}${trackLink ? ` &middot; <a href="${escapeAttr(trackLink)}" style="color:#64748b;text-decoration:underline;">Track link</a>` : ''}</div>
          </td>
          <td align="right" style="font-size:15px;font-weight:700;color:#0f172a;white-space:nowrap;">${cs}${fmt(linePrice)}</td>
        </tr></table>
      </td></tr>`;
  }).join('');

  // Optional rows (subtotal, promo, VAT)
  const subtotalRow = opts.subtotal != null && opts.subtotal !== '' ? `
    <tr><td style="padding:8px 0;font-size:14px;color:#475569;">Subtotal</td>
        <td align="right" style="padding:8px 0;font-size:14px;color:#475569;">${cs}${fmt(opts.subtotal)}</td></tr>` : '';

  const promoRow = opts.promoCode && opts.promoDiscount ? `
    <tr><td style="padding:8px 0;font-size:14px;color:#00b377;">Discount (${escapeHtml(opts.promoCode)})</td>
        <td align="right" style="padding:8px 0;font-size:14px;color:#00b377;">\u2212${cs}${fmt(opts.promoDiscount)}</td></tr>` : '';

  const vatRow = opts.taxPrice && Number(opts.taxPrice) > 0 ? `
    <tr><td style="padding:8px 0;font-size:14px;color:#475569;">
          VAT${opts.taxRate ? ` (${escapeHtml(String(opts.taxRate))}%)` : ''}${opts.billingCountryName ? ` &middot; ${escapeHtml(opts.billingCountryName)}` : ''}
        </td>
        <td align="right" style="padding:8px 0;font-size:14px;color:#475569;">${cs}${fmt(opts.taxPrice)}</td></tr>` : '';

  const reverseChargeRow = opts.vatReverseCharge ? `
    <tr><td colspan="2" style="padding:6px 0;font-size:12px;color:#64748b;line-height:1.4;">
          VAT reverse charge applies &middot; B2B intra-EU${opts.customerVatId ? ` &middot; VAT ID: <b>${escapeHtml(opts.customerVatId)}</b>` : ''}
        </td></tr>` : '';

  const created = opts.createdAt || new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  const stripeUrl = opts.stripePaymentUrl || '#';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Complete payment via Stripe</title></head>
<body style="margin:0;padding:0;background:#f3f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
<div style="display:none;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">Complete your Breakout order ${escapeHtml(opts.orderNumber)} \u2014 secure card payment via Stripe.</div>
<table cellpadding="0" cellspacing="0" width="100%" style="background:#f3f5f9;"><tr><td align="center" style="padding:32px 16px;">
<table cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
  <tr><td align="center" style="font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#0f172a;padding:8px 0 4px;">Break<span style="color:#1ed760;">out</span></td></tr>
  <tr><td align="center" style="padding:12px 0 24px;">
    <span style="display:inline-block;padding:8px 18px;border-radius:999px;background:#ffffff;border:1px solid #e2e8f0;font-size:13px;color:#475569;">
      Order: <b style="color:#0f172a;">#${escapeHtml(opts.orderNumber)}</b> &middot; ${escapeHtml(created)}
    </span>
  </td></tr>

  <!-- Payment card -->
  <tr><td style="background:#ffffff;border-radius:18px;padding:36px 32px;box-shadow:0 1px 2px rgba(15,23,42,0.04);">
    <div style="background:#f1f5f9;border-radius:14px;padding:16px 20px;text-align:center;font-size:14px;color:#475569;line-height:1.5;margin-bottom:28px;">
      Please complete your order securely using the <b style="color:#0f172a;">Stripe Payment</b> button below.
    </div>

    <h1 style="margin:0;text-align:center;font-size:38px;font-weight:900;letter-spacing:-0.8px;color:#0f172a;line-height:1.1;">Pay via Stripe</h1>
    <p style="text-align:center;color:#475569;font-size:15px;margin:12px 0 0;">Secure card payment &middot; Total: <b style="color:#0f172a;">${cs}${fmt(opts.total)}</b></p>

    <div style="height:1px;background:#e2e8f0;margin:28px 0;"></div>

    <div style="text-align:center;margin:8px 0 28px;">
      <a href="${escapeAttr(stripeUrl)}" target="_blank" rel="noopener" style="display:inline-block;padding:16px 44px;border-radius:14px;background:linear-gradient(90deg,#1ed760 0%,#00b377 100%);color:#ffffff;font-size:17px;font-weight:900;letter-spacing:0.2px;text-decoration:none;box-shadow:0 10px 24px rgba(30,215,96,0.25);">
        Pay ${cs}${fmt(opts.total)}
      </a>
    </div>

    <p style="text-align:center;color:#0f172a;font-size:14px;margin:0 0 14px;line-height:1.5;">Once the payment is confirmed, <b>your order will be processed automatically</b> within minutes.</p>
    <p style="text-align:center;color:#475569;font-size:14px;margin:0 0 24px;">Thank you for choosing <b style="color:#0f172a;">Breakout</b>.</p>

    <p style="text-align:center;color:#475569;font-size:13px;line-height:1.55;margin:0 0 8px;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="text-align:center;margin:0;"><a href="${escapeAttr(stripeUrl)}" style="color:#00b377;font-size:13px;word-break:break-all;">${escapeHtml(stripeUrl)}</a></p>

    <p style="text-align:center;color:#94a3b8;font-size:13px;margin:20px 0 0;">Questions? Just reply to this email.</p>
  </td></tr>

  <tr><td style="height:20px;line-height:20px;font-size:0;">&nbsp;</td></tr>

  <!-- Order details card -->
  <tr><td style="background:#ffffff;border-radius:18px;padding:36px 32px;box-shadow:0 1px 2px rgba(15,23,42,0.04);">
    <h2 style="text-align:center;margin:0 0 4px;font-size:24px;font-weight:900;color:#0f172a;">Order details</h2>
    <p style="text-align:center;color:#94a3b8;font-size:13px;margin:0 0 24px;">Receipt summary</p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${itemsHtml}
      <tr><td colspan="2" style="border-top:1px solid #e2e8f0;padding-top:14px;"></td></tr>
      ${subtotalRow}
      ${promoRow}
      ${vatRow}
      ${reverseChargeRow}
      <tr><td style="padding:14px 0 0;border-top:1px solid #e2e8f0;margin-top:6px;font-size:17px;font-weight:900;color:#0f172a;">Total with taxes</td>
          <td align="right" style="padding:14px 0 0;border-top:1px solid #e2e8f0;font-size:17px;font-weight:900;color:#0f172a;">${cs}${fmt(opts.total)}</td></tr>
    </table>

    <div style="padding-top:22px;font-size:13px;color:#64748b;">
      Customer email:<br>
      <a href="mailto:${escapeAttr(opts.customerEmail)}" style="color:#00b377;"><b>${escapeHtml(opts.customerEmail)}</b></a>
    </div>
  </td></tr>

  <tr><td align="center" style="color:#94a3b8;font-size:12px;padding:18px 0 0;">&copy; ${new Date().getFullYear()} Breakout</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// Tiny HTML escaping helpers (no DOMPurify on Workers)
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function escapeAttr(s) { return escapeHtml(s); }

export async function sendStripePaymentEmail(env, opts) {
  // opts: same as buildStripePaymentEmailHtml + customerEmail
  console.log('STRIPE_EMAIL_FUNC_CALLED', opts.customerEmail, opts.orderNumber);
  if (!env.BREVO_API_KEY) { console.warn('BREVO_API_KEY_NOT_SET'); return; }
  const html = buildStripePaymentEmailHtml(opts);
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Breakout', email: 'hello@breakoutmusic.io' },
        to: [{ email: opts.customerEmail }],
        subject: `Breakout | Complete Your Stripe Payment | Order #${opts.orderNumber}`,
        htmlContent: html,
        replyTo: { email: 'breakoutmusic@gmail.com', name: 'Breakout Support' },
      }),
    });
    const body = await res.text();
    console.log('STRIPE_BREVO_RESPONSE', res.status, body.slice(0, 200));
  } catch (err) {
    console.error('STRIPE_EMAIL_ERROR', err.message);
  }
}
