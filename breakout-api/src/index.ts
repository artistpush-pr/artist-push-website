var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/email.js
function buildOrderEmailHtml(orderNumber, email, items, totalAmount, currency) {
  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:12px 16px;color:#e0e0e0;font-size:14px;border-bottom:1px solid #1e1e1e;">
        ${item.serviceType}${item.serviceVariant ? " \xB7 " + item.serviceVariant : ""}
      </td>
      <td style="padding:12px 16px;color:#e0e0e0;font-size:14px;text-align:center;border-bottom:1px solid #1e1e1e;">
        ${item.quantity}
      </td>
      <td style="padding:12px 16px;color:#e0e0e0;font-size:14px;text-align:right;border-bottom:1px solid #1e1e1e;">
        $${(item.quantity * item.unitPrice).toFixed(2)}
      </td>
    </tr>
  `).join("");
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
    <p style="margin:0 0 8px;color:#999;font-size:12px;">Questions? <a href="mailto:breakoutmusicsupport@gmail.com" style="color:#00FF85;text-decoration:none;">breakoutmusicsupport@gmail.com</a></p>
    <p style="margin:0;color:#666;font-size:11px;">&copy; 2026 Breakout. Estonia, EU.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
__name(buildOrderEmailHtml, "buildOrderEmailHtml");
async function sendOrderConfirmationEmail(env, email, orderNumber, items, totalAmount, currency) {
  console.log("EMAIL_FUNC_CALLED", email, orderNumber);
  if (!env.BREVO_API_KEY) {
    console.warn("BREVO_API_KEY_NOT_SET");
    return;
  }
  console.log("BREVO_KEY_EXISTS");
  const html = buildOrderEmailHtml(orderNumber, email, items, totalAmount, currency);
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Jay Finn", email: "hello@breakoutmusic.io" },
        to: [{ email }],
        subject: "Order Confirmed \u2014 " + orderNumber,
        htmlContent: html,
        replyTo: { email: "breakoutmusicsupport@gmail.com", name: "Breakout Support" }
      })
    });
    const body = await res.text();
    console.log("BREVO_RESPONSE", res.status, body);
  } catch (err) {
    console.error("EMAIL_ERROR", err.message);
  }
}
__name(sendOrderConfirmationEmail, "sendOrderConfirmationEmail");
function buildPayPalEmailHtml(orderNumber, email, items, totalAmount, currency) {
  const PAYPAL_EMAIL = "yana_grishkina@ukr.net";
  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">
        ${item.serviceType}${item.serviceVariant ? " \xB7 " + item.serviceVariant : ""}
        <span style="color:#64748b;"> \xD7 ${item.quantity}</span>
      </td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#0f172a;">
        $${(item.quantity * item.unitPrice).toFixed(2)}
      </td>
    </tr>`).join("");
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
    <p style="color:#64748b;margin-top:8px;font-size:15px;">Friends &amp; Family only \xB7 No notes</p>
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
  Pudisoo k\xFCla, M\xE4nnim\xE4e/1, Kuusalu vald, Harju maakond, 74626, Estonia<br>
  <a href="mailto:breakoutmusicsupport@gmail.com" style="color:#94a3b8;">breakoutmusicsupport@gmail.com</a><br>
  &copy; 2026 Breakout \xB7 All rights reserved
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
__name(buildPayPalEmailHtml, "buildPayPalEmailHtml");
async function sendPayPalInstructionsEmail(env, email, orderNumber, items, totalAmount, currency) {
  console.log("PAYPAL_EMAIL_FUNC_CALLED", email, orderNumber);
  if (!env.BREVO_API_KEY) {
    console.warn("BREVO_API_KEY_NOT_SET");
    return;
  }
  const html = buildPayPalEmailHtml(orderNumber, email, items, totalAmount, currency);
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Breakout", email: "hello@breakoutmusic.io" },
        to: [{ email }],
        subject: "Order #" + orderNumber + " \u2014 complete payment via PayPal",
        htmlContent: html,
        replyTo: { email: "breakoutmusicsupport@gmail.com", name: "Breakout Support" }
      })
    });
    const body = await res.text();
    console.log("PAYPAL_BREVO_RESPONSE", res.status, body);
  } catch (err) {
    console.error("PAYPAL_EMAIL_ERROR", err.message);
  }
}
__name(sendPayPalInstructionsEmail, "sendPayPalInstructionsEmail");
function buildPasswordResetHtml(name, resetUrl) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding:32px 12px">
<table cellpadding="0" cellspacing="0" width="560" style="max-width:560px;width:100%;">
<tr><td style="background:#fff;border-radius:18px;padding:32px;text-align:center;">
  <strong style="font-size:22px;color:#1ed760;">Breakout</strong>
  <h1 style="margin:24px 0 12px;font-size:24px;color:#0f172a;">Reset your password</h1>
  <p style="margin:0 0 22px;color:#64748b;font-size:15px;line-height:1.6;">${name ? "Hi " + name + "," : "Hi,"} we received a request to reset the password for your Breakout account. Click the button below to set a new password. This link expires in 1 hour.</p>
  <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:14px;font-size:16px;font-weight:900;color:#fff;background:linear-gradient(90deg,#1ed760 0%,#00b377 100%);text-decoration:none;box-shadow:0 10px 24px rgba(30,215,96,0.28);">Reset password</a>
  <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5;">Or copy and paste this URL into your browser:<br><a href="${resetUrl}" style="color:#1ed760;word-break:break-all;">${resetUrl}</a></p>
  <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0;">
  <p style="margin:0;color:#94a3b8;font-size:12.5px;line-height:1.55;">If you didn't request a password reset, you can safely ignore this email \u2014 your password will not be changed.</p>
</td></tr>
<tr><td align="center" style="font-size:12px;color:#94a3b8;padding:18px 12px;line-height:1.6;">
  <strong style="color:#475569;font-size:13px;">Breakout</strong> \xB7 Estonia, EU<br>
  <a href="mailto:breakoutmusicsupport@gmail.com" style="color:#94a3b8;">breakoutmusicsupport@gmail.com</a>
</td></tr></table></td></tr></table></body></html>`;
}
__name(buildPasswordResetHtml, "buildPasswordResetHtml");
async function sendPasswordResetEmail(env, email, name, resetUrl) {
  if (!env.BREVO_API_KEY) {
    console.warn("BREVO_API_KEY_NOT_SET");
    return;
  }
  const html = buildPasswordResetHtml(name, resetUrl);
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Breakout", email: "hello@breakoutmusic.io" },
        to: [{ email }],
        subject: "Reset your Breakout password",
        htmlContent: html,
        replyTo: { email: "breakoutmusicsupport@gmail.com", name: "Breakout Support" }
      })
    });
    console.log("PWRESET_BREVO_RESPONSE", res.status);
  } catch (err) {
    console.error("PWRESET_EMAIL_ERROR", err.message);
  }
}
__name(sendPasswordResetEmail, "sendPasswordResetEmail");
function buildStripePaymentEmailHtml(opts) {
  const cs = opts.currencySymbol || "$";
  const fmt = /* @__PURE__ */ __name((n) => (Math.round(Number(n) * 100) / 100).toFixed(2), "fmt");
  const itemsHtml = (opts.items || []).map((it) => {
    const linePrice = it.totalPrice != null ? it.totalPrice : it.unitPrice ? it.unitPrice * (it.quantity || 1) : 0;
    const title = [it.platform, it.serviceType, it.serviceVariant].filter(Boolean).join(" \u2014 ") || it.title || "Service";
    const trackLink = it.targetUrl || it.target_url;
    return `
      <tr><td style="padding:14px 0;border-top:1px solid #e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-size:15px;font-weight:700;color:#0f172a;">
            ${escapeHtml(title)}
            <div style="font-size:13px;color:#64748b;font-weight:400;margin-top:2px;">Qty ${it.quantity || 1}${trackLink ? ` &middot; <a href="${escapeAttr(trackLink)}" style="color:#64748b;text-decoration:underline;">Track link</a>` : ""}</div>
          </td>
          <td align="right" style="font-size:15px;font-weight:700;color:#0f172a;white-space:nowrap;">${cs}${fmt(linePrice)}</td>
        </tr></table>
      </td></tr>`;
  }).join("");
  const subtotalRow = opts.subtotal != null && opts.subtotal !== "" ? `
    <tr><td style="padding:8px 0;font-size:14px;color:#475569;">Subtotal</td>
        <td align="right" style="padding:8px 0;font-size:14px;color:#475569;">${cs}${fmt(opts.subtotal)}</td></tr>` : "";
  const promoRow = opts.promoCode && opts.promoDiscount ? `
    <tr><td style="padding:8px 0;font-size:14px;color:#00b377;">Discount (${escapeHtml(opts.promoCode)})</td>
        <td align="right" style="padding:8px 0;font-size:14px;color:#00b377;">\u2212${cs}${fmt(opts.promoDiscount)}</td></tr>` : "";
  const vatRow = opts.taxPrice && Number(opts.taxPrice) > 0 ? `
    <tr><td style="padding:8px 0;font-size:14px;color:#475569;">
          VAT${opts.taxRate ? ` (${escapeHtml(String(opts.taxRate))}%)` : ""}${opts.billingCountryName ? ` &middot; ${escapeHtml(opts.billingCountryName)}` : ""}
        </td>
        <td align="right" style="padding:8px 0;font-size:14px;color:#475569;">${cs}${fmt(opts.taxPrice)}</td></tr>` : "";
  const reverseChargeRow = opts.vatReverseCharge ? `
    <tr><td colspan="2" style="padding:6px 0;font-size:12px;color:#64748b;line-height:1.4;">
          VAT reverse charge applies &middot; B2B intra-EU${opts.customerVatId ? ` &middot; VAT ID: <b>${escapeHtml(opts.customerVatId)}</b>` : ""}
        </td></tr>` : "";
  const created = opts.createdAt || (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const stripeUrl = opts.stripePaymentUrl || "#";
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
        Pay via Stripe
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

  <tr><td align="center" style="color:#94a3b8;font-size:12px;padding:18px 0 0;">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Breakout</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
__name(buildStripePaymentEmailHtml, "buildStripePaymentEmailHtml");
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(escapeHtml, "escapeHtml");
function escapeAttr(s) {
  return escapeHtml(s);
}
__name(escapeAttr, "escapeAttr");
async function sendStripePaymentEmail(env, opts) {
  console.log("STRIPE_EMAIL_FUNC_CALLED", opts.customerEmail, opts.orderNumber);
  if (!env.BREVO_API_KEY) {
    console.warn("BREVO_API_KEY_NOT_SET");
    return;
  }
  const html = buildStripePaymentEmailHtml(opts);
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Breakout", email: "hello@breakoutmusic.io" },
        to: [{ email: opts.customerEmail }],
        subject: `Breakout | Complete Your Stripe Payment | Order #${opts.orderNumber}`,
        htmlContent: html,
        replyTo: { email: "breakoutmusicsupport@gmail.com", name: "Breakout Support" }
      })
    });
    const body = await res.text();
    console.log("STRIPE_BREVO_RESPONSE", res.status, body.slice(0, 200));
  } catch (err) {
    console.error("STRIPE_EMAIL_ERROR", err.message);
  }
}
__name(sendStripePaymentEmail, "sendStripePaymentEmail");

// src/stripe.js
var STRIPE_API_BASE = "https://api.stripe.com/v1";
async function retrieveStripeSession(env, sessionId) {
  const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions/${sessionId}`, {
    headers: { "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}` }
  });
  return res.ok ? await res.json() : null;
}
__name(retrieveStripeSession, "retrieveStripeSession");
async function createStripePaymentLink(env, opts) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY not set in env");
  }
  const currency = (opts.currency || "USD").toLowerCase();
  const stripeHeaders = {
    "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded"
  };
  const totalCents = opts.items.reduce(
    (sum, i) => sum + Math.round((i.unitPrice || 0) * (i.quantity || 1) * 100),
    0
  );
  const discountCents = Math.round((opts.promoDiscount || 0) * 100);
  const vatCents = Math.round((opts.vatAmount || 0) * 100);
  const finalCents = Math.max(50, totalCents - discountCents + vatCents);
  const itemCount = opts.items.length;
  const productDesc = `${itemCount} service${itemCount > 1 ? "s" : ""}`;
  const pParams = new URLSearchParams();
  pParams.append("name", "Order #" + opts.orderNumber);
  pParams.append("metadata[order_number]", opts.orderNumber);
  pParams.append("metadata[order_id]", String(opts.orderId));
  const pRes = await fetch(`${STRIPE_API_BASE}/products`, {
    method: "POST",
    headers: stripeHeaders,
    body: pParams
  });
  const product = await pRes.json();
  if (!pRes.ok) {
    console.error("STRIPE_PRODUCT_FAILED", JSON.stringify(product));
    throw new Error("Stripe product error: " + (product.error?.message || pRes.status));
  }
  const prParams = new URLSearchParams();
  prParams.append("product", product.id);
  prParams.append("unit_amount", String(finalCents));
  prParams.append("currency", currency);
  const prRes = await fetch(`${STRIPE_API_BASE}/prices`, {
    method: "POST",
    headers: stripeHeaders,
    body: prParams
  });
  const price = await prRes.json();
  if (!prRes.ok) {
    console.error("STRIPE_PRICE_FAILED", JSON.stringify(price));
    throw new Error("Stripe price error: " + (price.error?.message || prRes.status));
  }
  const linkParams = new URLSearchParams();
  linkParams.append("line_items[0][price]", price.id);
  linkParams.append("line_items[0][quantity]", "1");
  linkParams.append("metadata[order_id]", String(opts.orderId));
  linkParams.append("metadata[order_number]", opts.orderNumber);
  linkParams.append("payment_intent_data[metadata][order_id]", String(opts.orderId));
  linkParams.append("payment_intent_data[metadata][order_number]", opts.orderNumber);
  if (opts.vatAmount && opts.vatAmount > 0) {
    linkParams.append("payment_intent_data[metadata][vat_amount]", String(opts.vatAmount.toFixed(2)));
    if (opts.vatRate) linkParams.append("payment_intent_data[metadata][vat_rate]", String(opts.vatRate));
    if (opts.billingCountry) linkParams.append("payment_intent_data[metadata][billing_country]", String(opts.billingCountry));
  }
  if (opts.vatId) linkParams.append("payment_intent_data[metadata][vat_id]", String(opts.vatId));
  linkParams.append("payment_intent_data[description]", "Order #" + opts.orderNumber);
  linkParams.append("after_completion[type]", "redirect");
  linkParams.append(
    "after_completion[redirect][url]",
    `${opts.successUrl}${opts.successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`
  );
  linkParams.append("customer_creation", "always");
  const linkRes = await fetch(`${STRIPE_API_BASE}/payment_links`, {
    method: "POST",
    headers: stripeHeaders,
    body: linkParams
  });
  const link = await linkRes.json();
  if (!linkRes.ok) {
    console.error("STRIPE_PAYMENT_LINK_FAILED", JSON.stringify(link));
    throw new Error("Stripe payment_link error: " + (link.error?.message || linkRes.status));
  }
  if (opts.customerEmail) {
    link.url = link.url + (link.url.includes("?") ? "&" : "?") + "prefilled_email=" + encodeURIComponent(opts.customerEmail);
  }
  return link;
}
__name(createStripePaymentLink, "createStripePaymentLink");
async function verifyStripeSignature(payload, sigHeader, secret, toleranceSeconds = 300) {
  if (!sigHeader || !secret) return null;
  const parts = sigHeader.split(",").map((p) => p.trim());
  const tsPart = parts.find((p) => p.startsWith("t="));
  const v1Part = parts.find((p) => p.startsWith("v1="));
  if (!tsPart || !v1Part) return null;
  const timestamp = tsPart.slice(2);
  const expectedSig = v1Part.slice(3);
  const ageSeconds = Math.floor(Date.now() / 1e3) - parseInt(timestamp, 10);
  if (isNaN(ageSeconds) || ageSeconds < -60 || ageSeconds > toleranceSeconds) return null;
  const encoder = new TextEncoder();
  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const sigHex = Array.from(new Uint8Array(sigBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (sigHex.length !== expectedSig.length) return null;
  let mismatch = 0;
  for (let i = 0; i < sigHex.length; i++) {
    mismatch |= sigHex.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  if (mismatch !== 0) return null;
  try {
    return JSON.parse(payload);
  } catch (err) {
    console.error("STRIPE_WEBHOOK_PARSE_ERROR", err.message);
    return null;
  }
}
__name(verifyStripeSignature, "verifyStripeSignature");

// src/hipay.js
var DEFAULT_GATEWAY = "https://secure-gateway.hipay-tpp.com/rest/v1";
async function createHipayOrder(env, opts) {
  if (!env.HIPAY_API_USERNAME || !env.HIPAY_API_PASSWORD) {
    throw new Error("HIPAY_API_USERNAME / HIPAY_API_PASSWORD not set in env");
  }
  const gateway = env.HIPAY_BASE_URL || DEFAULT_GATEWAY;
  const params = new URLSearchParams();
  params.append("orderid", opts.orderNumber);
  params.append("description", `Order #${opts.orderNumber}`);
  if (opts.items?.length) {
    params.append("long_description", `Breakout \u2014 ${opts.items.length} service${opts.items.length > 1 ? "s" : ""}`);
  }
  params.append("currency", (opts.currency || "USD").toUpperCase());
  params.append("amount", Number(opts.amount).toFixed(2));
  params.append("shipping", "0");
  params.append("tax", Number(opts.vatAmount || 0).toFixed(2));
  params.append("cid", `breakout-${opts.customerEmail}`);
  params.append("email", opts.customerEmail);
  params.append("firstname", opts.firstname || "Customer");
  params.append("lastname", opts.lastname || "Customer");
  if (opts.phone) params.append("phone", opts.phone);
  params.append("cardtoken", opts.cardToken);
  params.append("payment_product", opts.paymentProduct || "visa");
  params.append("operation", "Sale");
  params.append("eci", "7");
  params.append("authentication_indicator", "2");
  params.append("device_channel", String("02"));
  const b = opts.browser || {};
  const browserInfo = {
    ipaddr: opts.ipAddress || "0.0.0.0",
    http_accept: opts.acceptHeader || "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    http_user_agent: opts.userAgent || "Mozilla/5.0",
    java_enabled: b.javaEnabled ?? false,
    javascript_enabled: b.javascriptEnabled ?? true,
    language: b.language || "en-US",
    color_depth: b.colorDepth ?? 24,
    screen_height: b.screenHeight ?? 768,
    screen_width: b.screenWidth ?? 1024,
    timezone: b.timezone ?? 0
  };
  params.append("browser_info", JSON.stringify(browserInfo));
  params.append("ipaddr", browserInfo.ipaddr);
  params.append("http_user_agent", browserInfo.http_user_agent);
  params.append("http_accept", browserInfo.http_accept);
  params.append("country", opts.billingCountry || "EE");
  params.append("streetaddress", opts.streetAddress || "N/A");
  params.append("city", opts.city || "N/A");
  params.append("zipcode", opts.zipcode || "00000");
  if (opts.state) params.append("state", opts.state);
  params.append("accept_url", opts.acceptUrl);
  params.append("decline_url", opts.declineUrl);
  params.append("pending_url", opts.pendingUrl || opts.acceptUrl);
  params.append("exception_url", opts.exceptionUrl || opts.declineUrl);
  params.append("cancel_url", opts.cancelUrl || opts.declineUrl);
  if (opts.notifyUrl) params.append("notify_url", opts.notifyUrl);
  const _bodyLines = [];
  for (const [k, v] of params.entries()) {
    if (k === "cardtoken") _bodyLines.push(`${k}=<masked:${v.slice(0, 8)}...>`);
    else _bodyLines.push(`${k}=${v}`);
  }
  console.log("HIPAY_ORDER_REQUEST_BODY for orderNumber=" + opts.orderNumber + ":\n" + _bodyLines.join("\n"));
  const credentials = btoa(`${env.HIPAY_API_USERNAME}:${env.HIPAY_API_PASSWORD}`);
  const res = await fetch(`${gateway}/order`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    },
    body: params
  });
  const result = await res.json();
  if (!res.ok) {
    console.error("HIPAY_ORDER_FAILED", JSON.stringify(result));
    throw new Error("HiPay error: " + (result?.message || result?.description || res.status));
  }
  console.log(
    "HIPAY_ORDER_RESPONSE",
    "state=",
    result.state,
    "status=",
    result.status,
    "transactionReference=",
    result.transactionReference,
    "forwardUrl=",
    result.forwardUrl || "none",
    "authorizedAmount=",
    result.authorizedAmount,
    "capturedAmount=",
    result.capturedAmount,
    "reason=",
    result.reason ? JSON.stringify(result.reason) : "none"
  );
  return result;
}
__name(createHipayOrder, "createHipayOrder");
async function verifyHipayNotificationSignature(payload, signatureHeader, passphrase) {
  if (!signatureHeader || !passphrase) return false;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload + passphrase);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const expected = signatureHeader.trim().toLowerCase();
  if (hashHex.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < hashHex.length; i++) {
    mismatch |= hashHex.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}
__name(verifyHipayNotificationSignature, "verifyHipayNotificationSignature");
var HIPAY_STATES = {
  COMPLETED: "completed",
  FORWARDING: "forwarding",
  PENDING: "pending",
  DECLINED: "declined",
  ERROR: "error"
};

// src/vat.js
var EU_VAT_RATES = {
  AT: 20,
  BE: 21,
  BG: 20,
  HR: 25,
  CY: 19,
  CZ: 21,
  DK: 25,
  EE: 24,
  FI: 25.5,
  FR: 20,
  DE: 19,
  GR: 24,
  HU: 27,
  IE: 23,
  IT: 22,
  LV: 21,
  LT: 21,
  LU: 17,
  MT: 18,
  NL: 21,
  PL: 23,
  PT: 23,
  RO: 21,
  SK: 23,
  SI: 22,
  SE: 25,
  ES: 21
};
var VAT_ID_REGEX = {
  AT: /^ATU\d{8}$/,
  BE: /^BE0?\d{9,10}$/,
  BG: /^BG\d{9,10}$/,
  HR: /^HR\d{11}$/,
  CY: /^CY\d{8}[A-Z]$/,
  CZ: /^CZ\d{8,10}$/,
  DK: /^DK\d{8}$/,
  EE: /^EE\d{9}$/,
  FI: /^FI\d{8}$/,
  FR: /^FR[A-HJ-NP-Z0-9]{2}\d{9}$/,
  DE: /^DE\d{9}$/,
  GR: /^EL\d{9}$/,
  HU: /^HU\d{8}$/,
  IE: /^IE(?:\d{7}[A-W]|\d[A-Z+*]\d{5}[A-W]|\d{7}[A-W][A-I])$/,
  IT: /^IT\d{11}$/,
  LV: /^LV\d{11}$/,
  LT: /^LT(?:\d{9}|\d{12})$/,
  LU: /^LU\d{8}$/,
  MT: /^MT\d{8}$/,
  NL: /^NL\d{9}B\d{2}$/,
  PL: /^PL\d{10}$/,
  PT: /^PT\d{9}$/,
  RO: /^RO\d{2,10}$/,
  SK: /^SK\d{10}$/,
  SI: /^SI\d{8}$/,
  SE: /^SE\d{12}$/,
  ES: /^ES(?:[A-Z]\d{7}[A-Z]|[A-Z]\d{8}|\d{8}[A-Z])$/
};
var HOME_COUNTRY = "EE";
var CARDINITY_CHECKOUT_URL = "https://checkout.cardinity.com";
async function cardinityHmacHex(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sigBuf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(cardinityHmacHex, "cardinityHmacHex");
async function cardinitySign(attrs, secret) {
  const keys = Object.keys(attrs).filter((k) => attrs[k] !== null && attrs[k] !== void 0 && attrs[k] !== "").sort();
  const message = keys.map((k) => k + attrs[k]).join("");
  return cardinityHmacHex(message, secret);
}
__name(cardinitySign, "cardinitySign");
async function verifyCardinityCallback(fields, secret) {
  if (!fields.signature || !secret) return false;
  const provided = String(fields.signature).toLowerCase();
  const attrs = { ...fields };
  delete attrs.signature;
  const keys = Object.keys(attrs).sort();
  // Cardinity signs callback responses over ALL attributes including empty
  // ones (e.g. live=""), unlike requests where empty attrs are omitted.
  // Accept either variant to be safe.
  const msgAll = keys.map((k) => k + attrs[k]).join("");
  if (await cardinityHmacHex(msgAll, secret) === provided) return true;
  const msgNonEmpty = keys.filter((k) => attrs[k] !== null && attrs[k] !== void 0 && attrs[k] !== "").map((k) => k + attrs[k]).join("");
  return await cardinityHmacHex(msgNonEmpty, secret) === provided;
}
__name(verifyCardinityCallback, "verifyCardinityCallback");
function isValidVatIdFormat(country, vatId) {
  if (!country || !vatId) return false;
  let cleaned = String(vatId).replace(/[\s.\-]/g, "").toUpperCase();
  if (country === "GR" && cleaned.startsWith("GR")) {
    cleaned = "EL" + cleaned.slice(2);
  }
  const rx = VAT_ID_REGEX[country];
  return rx ? rx.test(cleaned) : false;
}
__name(isValidVatIdFormat, "isValidVatIdFormat");
function calculateVat(subtotalAfterDiscount, country, vatId) {
  const sub = Number(subtotalAfterDiscount) || 0;
  const ctry = (country || "").toUpperCase();
  const rate = EU_VAT_RATES[ctry];
  if (rate === void 0) {
    return { vatRate: 0, vatAmount: 0, reverseCharge: false, isEU: false, vatIdValid: false };
  }
  const validId = isValidVatIdFormat(ctry, vatId);
  const reverseCharge = validId && ctry !== HOME_COUNTRY;
  const effRate = reverseCharge ? 0 : rate;
  const vatAmount = Math.round(sub * effRate) / 100;
  return {
    vatRate: effRate,
    vatAmount,
    reverseCharge,
    isEU: true,
    vatIdValid: validId
  };
}
__name(calculateVat, "calculateVat");

// src/auth.js
var PBKDF2_ITERATIONS = 1e5;
var JWT_EXPIRY_DAYS = 30;
var RESET_TOKEN_EXPIRY_HOURS = 1;
function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
__name(b64url, "b64url");
function b64urlDecode(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return new Uint8Array(atob(s).split("").map((c) => c.charCodeAt(0)));
}
__name(b64urlDecode, "b64urlDecode");
function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors }
  });
}
__name(json, "json");
function validatePassword(pw) {
  if (typeof pw !== "string") return "Password is required.";
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (pw.length > 100) return "Password too long.";
  return null;
}
__name(validatePassword, "validatePassword");
function validateEmail(email) {
  if (typeof email !== "string" || !email.trim()) return "Email is required.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Invalid email.";
  return null;
}
__name(validateEmail, "validateEmail");
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return { hash: b64url(hash), salt: b64url(salt) };
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, storedHash, storedSalt) {
  try {
    const salt = b64urlDecode(storedSalt);
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const hash = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      key,
      256
    );
    const computed = b64url(hash);
    if (computed.length !== storedHash.length) return false;
    let mismatch = 0;
    for (let i = 0; i < computed.length; i++) mismatch |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
    return mismatch === 0;
  } catch {
    return false;
  }
}
__name(verifyPassword, "verifyPassword");
async function signJWT(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const data = b64url(new TextEncoder().encode(JSON.stringify(header))) + "." + b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return data + "." + b64url(sig);
}
__name(signJWT, "signJWT");
async function verifyJWT(token, secret) {
  try {
    const [h, b, s] = token.split(".");
    if (!h || !b || !s) return null;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlDecode(s),
      new TextEncoder().encode(h + "." + b)
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(b)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3)) return null;
    return payload;
  } catch {
    return null;
  }
}
__name(verifyJWT, "verifyJWT");
async function getUserFromRequest(request, env) {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const payload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
  if (!payload || !payload.userId) return null;
  return await env.DB.prepare(
    "SELECT id, email, name, created_at FROM users WHERE id = ?"
  ).bind(payload.userId).first();
}
__name(getUserFromRequest, "getUserFromRequest");
function generateResetToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(generateResetToken, "generateResetToken");
async function hashResetToken(token) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashResetToken, "hashResetToken");
async function handleRegister(request, env, cors) {
  if (!env.JWT_SECRET) return json({ error: "Server not configured (JWT_SECRET missing)." }, 500, cors);
  const body = await request.json().catch(() => ({}));
  const { email, password, name } = body;
  const eErr = validateEmail(email);
  if (eErr) return json({ error: eErr }, 400, cors);
  const pErr = validatePassword(password);
  if (pErr) return json({ error: pErr }, 400, cors);
  const cleanEmail = email.trim().toLowerCase();
  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(cleanEmail).first();
  if (existing) return json({ error: "An account with this email already exists." }, 409, cors);
  const { hash, salt } = await hashPassword(password);
  const result = await env.DB.prepare(
    "INSERT INTO users (email, name, password_hash, password_salt) VALUES (?, ?, ?, ?)"
  ).bind(cleanEmail, name?.trim() || null, hash, salt).run();
  const userId = result.meta.last_row_id;
  const token = await signJWT(
    { userId, email: cleanEmail, exp: Math.floor(Date.now() / 1e3) + JWT_EXPIRY_DAYS * 86400 },
    env.JWT_SECRET
  );
  return json({ success: true, token, user: { id: userId, email: cleanEmail, name: name?.trim() || null } }, 201, cors);
}
__name(handleRegister, "handleRegister");
async function handleLogin(request, env, cors) {
  if (!env.JWT_SECRET) return json({ error: "Server not configured." }, 500, cors);
  const body = await request.json().catch(() => ({}));
  const { email, password } = body;
  if (!email || !password) return json({ error: "Email and password are required." }, 400, cors);
  const cleanEmail = email.trim().toLowerCase();
  const user = await env.DB.prepare(
    "SELECT id, email, name, password_hash, password_salt FROM users WHERE email = ?"
  ).bind(cleanEmail).first();
  if (!user) return json({ error: "Invalid email or password." }, 401, cors);
  const valid = await verifyPassword(password, user.password_hash, user.password_salt);
  if (!valid) return json({ error: "Invalid email or password." }, 401, cors);
  const token = await signJWT(
    { userId: user.id, email: user.email, exp: Math.floor(Date.now() / 1e3) + JWT_EXPIRY_DAYS * 86400 },
    env.JWT_SECRET
  );
  return json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } }, 200, cors);
}
__name(handleLogin, "handleLogin");
async function handleMe(request, env, cors) {
  const user = await getUserFromRequest(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401, cors);
  return json({ user }, 200, cors);
}
__name(handleMe, "handleMe");
async function handleForgotPassword(request, env, ctx, cors) {
  const body = await request.json().catch(() => ({}));
  const { email } = body;
  if (!email) return json({ error: "Email is required." }, 400, cors);
  const cleanEmail = email.trim().toLowerCase();
  const user = await env.DB.prepare(
    "SELECT id, email, name FROM users WHERE email = ?"
  ).bind(cleanEmail).first();
  if (!user) return json({ success: true }, 200, cors);
  await env.DB.prepare(
    "UPDATE password_resets SET used_at = datetime('now') WHERE user_id = ? AND used_at IS NULL"
  ).bind(user.id).run();
  const rawToken = generateResetToken();
  const tokenHash = await hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 3600 * 1e3).toISOString().replace("T", " ").slice(0, 19);
  await env.DB.prepare(
    "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)"
  ).bind(user.id, tokenHash, expiresAt).run();
  const resetUrl = "https://breakoutmusic.io/reset-password.html?token=" + rawToken + "&email=" + encodeURIComponent(user.email);
  ctx.waitUntil(sendPasswordResetEmail(env, user.email, user.name, resetUrl));
  return json({ success: true }, 200, cors);
}
__name(handleForgotPassword, "handleForgotPassword");
async function handleResetPassword(request, env, cors) {
  const body = await request.json().catch(() => ({}));
  const { email, token, newPassword } = body;
  if (!email || !token || !newPassword) return json({ error: "Missing fields." }, 400, cors);
  const pErr = validatePassword(newPassword);
  if (pErr) return json({ error: pErr }, 400, cors);
  const cleanEmail = email.trim().toLowerCase();
  const user = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(cleanEmail).first();
  if (!user) return json({ error: "Invalid or expired reset link." }, 400, cors);
  const tokenHash = await hashResetToken(token);
  const reset = await env.DB.prepare(
    "SELECT id, expires_at, used_at FROM password_resets WHERE user_id = ? AND token_hash = ?"
  ).bind(user.id, tokenHash).first();
  if (!reset) return json({ error: "Invalid or expired reset link." }, 400, cors);
  if (reset.used_at) return json({ error: "This reset link has already been used." }, 400, cors);
  if (/* @__PURE__ */ new Date(reset.expires_at + "Z") < /* @__PURE__ */ new Date()) return json({ error: "This reset link has expired." }, 400, cors);
  const { hash, salt } = await hashPassword(newPassword);
  await env.DB.prepare(
    "UPDATE users SET password_hash = ?, password_salt = ?, password_changed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
  ).bind(hash, salt, user.id).run();
  await env.DB.prepare(
    "UPDATE password_resets SET used_at = datetime('now') WHERE id = ?"
  ).bind(reset.id).run();
  return json({ success: true }, 200, cors);
}
__name(handleResetPassword, "handleResetPassword");
async function handleChangePassword(request, env, cors) {
  const user = await getUserFromRequest(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401, cors);
  const body = await request.json().catch(() => ({}));
  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) return json({ error: "Both passwords required." }, 400, cors);
  const pErr = validatePassword(newPassword);
  if (pErr) return json({ error: pErr }, 400, cors);
  if (currentPassword === newPassword) return json({ error: "New password must differ from current." }, 400, cors);
  const row = await env.DB.prepare(
    "SELECT password_hash, password_salt FROM users WHERE id = ?"
  ).bind(user.id).first();
  const valid = await verifyPassword(currentPassword, row.password_hash, row.password_salt);
  if (!valid) return json({ error: "Current password is incorrect." }, 401, cors);
  const { hash, salt } = await hashPassword(newPassword);
  await env.DB.prepare(
    "UPDATE users SET password_hash = ?, password_salt = ?, password_changed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
  ).bind(hash, salt, user.id).run();
  return json({ success: true }, 200, cors);
}
__name(handleChangePassword, "handleChangePassword");

// src/index.js
function corsHeaders(origin, allowedOrigin) {
  const allowed = origin === allowedOrigin || origin === "http://localhost:3000" || origin && /^https:\/\/[a-z0-9-]+\.breakout-music-io\.pages\.dev$/.test(origin) || origin && /^https:\/\/[a-z0-9-]+\.pages\.dev$/.test(origin) && origin.includes("breakout");
  return {
    "Access-Control-Allow-Origin": allowed ? origin : allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");
function json2(data, status = 200, cors = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors }
  });
}
__name(json2, "json");
async function isAuthorized(request, env) {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const password = auth.slice(7);
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
    console.warn("Admin auth DB check failed, falling back to env:", e.message);
  }
  return password === env.ADMIN_PASSWORD;
}
__name(isAuthorized, "isAuthorized");
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env.CORS_ORIGIN);
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    try {
      if (path === "/api/health" && method === "GET") {
        return json2({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() }, 200, cors);
      }
      if (path === "/api/promo/validate" && method === "GET") {
        const code = url.searchParams.get("code") || "";
        const itemsCount = parseInt(url.searchParams.get("items") || "0", 10);
        if (!code.trim()) return json2({ valid: false, error: "Empty code" }, 400, cors);
        const promo = await env.DB.prepare(
          `SELECT code, discount_percent, COALESCE(min_items, 1) as min_items FROM promo_codes
           WHERE LOWER(code) = LOWER(?) AND active = 1
             AND (expires_at IS NULL OR expires_at > datetime('now'))`
        ).bind(code.trim()).first();
        if (!promo) return json2({ valid: false }, 200, cors);
        if (itemsCount > 0 && itemsCount < promo.min_items) {
          return json2({ valid: false, error: `This code requires at least ${promo.min_items} items in your cart.`, minItems: promo.min_items }, 200, cors);
        }
        return json2({ valid: true, code: promo.code, discountPercent: promo.discount_percent, minItems: promo.min_items }, 200, cors);
      }
      if (path === "/api/checkout/abandon" && method === "POST") {
        const rawText = await request.text();
        let body = {};
        try {
          body = JSON.parse(rawText);
        } catch (e) {
          body = {};
        }
        const { email, items, subtotal, promoCode } = body;
        if (!email || !items || !items.length) return json2({ ok: false }, 200, cors);
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
        return json2({ ok: true }, 200, cors);
      }
      if (path === "/api/webhooks/stripe" && method === "POST") {
        const sig = request.headers.get("stripe-signature");
        const rawBody = await request.text();
        const event = await verifyStripeSignature(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
        if (!event) {
          console.warn("STRIPE_WEBHOOK_INVALID_SIG", sig?.slice(0, 30));
          return new Response("Invalid signature", { status: 400 });
        }
        console.log("STRIPE_WEBHOOK", event.type, event.id);
        try {
          if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const orderId = parseInt(session.metadata?.order_id, 10);
            const orderNumber = session.metadata?.order_number;
            if (!orderId) {
              console.warn("STRIPE_WEBHOOK_NO_ORDER_ID", session.id);
              return new Response("ok", { status: 200 });
            }
            const current = await env.DB.prepare(
              "SELECT id, payment_status, customer_id FROM orders WHERE id = ?"
            ).bind(orderId).first();
            if (!current) {
              console.warn("STRIPE_WEBHOOK_ORDER_NOT_FOUND", orderId);
              return new Response("ok", { status: 200 });
            }
            if (current.payment_status === "paid") {
              console.log("STRIPE_WEBHOOK_ALREADY_PAID", orderId);
              return new Response("ok", { status: 200 });
            }
            await env.DB.prepare(
              `UPDATE orders
                  SET payment_status = 'paid',
                      status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END,
                      stripe_payment_intent = COALESCE(?, stripe_payment_intent),
                      updated_at = datetime('now')
                WHERE id = ?`
            ).bind(session.payment_intent || null, orderId).run();
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
                  const itemsForSheet = (itemsResult.results || []).map((i) => ({
                    platform: i.platform,
                    serviceType: i.service_type,
                    serviceVariant: i.service_variant,
                    quantity: i.quantity,
                    targetUrl: i.target_url
                  }));
                  const resp = await fetch(env.SHEETS_WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orderNumber: order.order_number,
                      date: (order.created_at || "").slice(0, 10),
                      email: order.email,
                      items: itemsForSheet,
                      paymentMethod: "stripe"
                    })
                  });
                  console.log("SHEETS_WEBHOOK_SENT_STRIPE", order.order_number, resp.status);
                } catch (e) {
                  console.error("SHEETS_WEBHOOK_ERROR_STRIPE", e.message);
                }
              })());
            }
            return new Response("ok", { status: 200 });
          }
          if (event.type === "charge.refunded" || event.type === "charge.refund.updated") {
            const charge = event.data.object;
            const paymentIntentId = charge.payment_intent;
            if (paymentIntentId) {
              await env.DB.prepare(
                `UPDATE orders SET payment_status = 'refunded', updated_at = datetime('now')
                  WHERE stripe_payment_intent = ?`
              ).bind(paymentIntentId).run();
              console.log("STRIPE_WEBHOOK_REFUND_APPLIED", paymentIntentId);
            }
            return new Response("ok", { status: 200 });
          }
          if (event.type === "payment_intent.payment_failed") {
            const intent = event.data.object;
            console.log(
              "STRIPE_WEBHOOK_PAYMENT_FAILED",
              intent.id,
              intent.last_payment_error?.message
            );
            return new Response("ok", { status: 200 });
          }
          return new Response("ok", { status: 200 });
        } catch (err) {
          console.error("STRIPE_WEBHOOK_HANDLER_ERROR", err.message);
          return new Response("handler error", { status: 500 });
        }
      }
      if (path === "/api/hipay/config" && method === "GET") {
        if (!env.HIPAY_PUBLIC_USERNAME || !env.HIPAY_PUBLIC_PASSWORD) {
          return json2({ error: "HiPay not configured" }, 503, cors);
        }
        return json2({
          publicUsername: env.HIPAY_PUBLIC_USERNAME,
          publicPassword: env.HIPAY_PUBLIC_PASSWORD,
          environment: "production"
        }, 200, cors);
      }
      if (path === "/api/webhooks/hipay" && method === "POST") {
        const sig = request.headers.get("x-allopass-signature") || request.headers.get("X-Allopass-Signature");
        const rawBody = await request.text();
        const validSig = await verifyHipayNotificationSignature(
          rawBody,
          sig,
          env.HIPAY_WEBHOOK_PASSPHRASE
        );
        if (!validSig) {
          console.warn("HIPAY_WEBHOOK_INVALID_SIG", sig?.slice(0, 30));
          return new Response("Invalid signature", { status: 400 });
        }
        let payload;
        const ct = (request.headers.get("content-type") || "").toLowerCase();
        try {
          if (ct.includes("application/json")) {
            payload = JSON.parse(rawBody);
          } else {
            const fp = new URLSearchParams(rawBody);
            const xml = fp.get("xml");
            payload = xml ? JSON.parse(xml) : Object.fromEntries(fp.entries());
          }
        } catch (err) {
          console.error("HIPAY_WEBHOOK_PARSE_ERROR", err.message);
          return new Response("ok", { status: 200 });
        }
        const state = payload.state;
        const status = payload.status;
        const transactionRef = payload.transactionReference || payload.transaction_reference;
        const orderNumber = payload.order?.id || payload.orderid || payload.order_id || payload.merchantOrderId || payload.merchant_order_id;
        console.log("HIPAY_WEBHOOK", state, status, orderNumber, transactionRef);
        try {
          let current = null;
          if (orderNumber) {
            current = await env.DB.prepare(
              "SELECT id, payment_status FROM orders WHERE order_number = ?"
            ).bind(orderNumber).first();
          }
          if (!current && transactionRef) {
            current = await env.DB.prepare(
              "SELECT id, payment_status FROM orders WHERE hipay_transaction_ref = ?"
            ).bind(transactionRef).first();
          }
          const orderId = current?.id;
          if (!current) {
            console.warn(
              "HIPAY_WEBHOOK_ORDER_NOT_FOUND",
              "orderNumber=",
              orderNumber,
              "transactionRef=",
              transactionRef,
              "payload_keys=",
              Object.keys(payload).join(",")
            );
            return new Response("ok", { status: 200 });
          }
          if (state === HIPAY_STATES.COMPLETED || state === "completed") {
            if (current.payment_status === "paid") {
              console.log("HIPAY_WEBHOOK_ALREADY_PAID", orderId);
              return new Response("ok", { status: 200 });
            }
            await env.DB.prepare(
              `UPDATE orders
                  SET payment_status = 'paid',
                      status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END,
                      hipay_transaction_ref = ?,
                      updated_at = datetime('now')
                WHERE id = ?`
            ).bind(transactionRef || null, orderId).run();
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
                  const itemsForSheet = (itemsResult.results || []).map((i) => ({
                    platform: i.platform,
                    serviceType: i.service_type,
                    serviceVariant: i.service_variant,
                    quantity: i.quantity,
                    targetUrl: i.target_url
                  }));
                  const resp = await fetch(env.SHEETS_WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orderNumber: order.order_number,
                      date: (order.created_at || "").slice(0, 10),
                      email: order.email,
                      items: itemsForSheet,
                      paymentMethod: "hipay"
                    })
                  });
                  console.log("SHEETS_WEBHOOK_SENT_HIPAY", order.order_number, resp.status);
                } catch (e) {
                  console.error("SHEETS_WEBHOOK_ERROR_HIPAY", e.message);
                }
              })());
            }
            return new Response("ok", { status: 200 });
          }
          if (state === "refunded" || status === "124" || status === "125") {
            await env.DB.prepare(
              `UPDATE orders SET payment_status = 'refunded', updated_at = datetime('now')
                WHERE id = ?`
            ).bind(orderId).run();
            console.log("HIPAY_WEBHOOK_REFUND_APPLIED", orderId);
            return new Response("ok", { status: 200 });
          }
          if (state === HIPAY_STATES.DECLINED || state === HIPAY_STATES.ERROR) {
            console.log("HIPAY_WEBHOOK_DECLINED", orderId, payload.reason?.message || status);
            return new Response("ok", { status: 200 });
          }
          return new Response("ok", { status: 200 });
        } catch (err) {
          console.error("HIPAY_WEBHOOK_HANDLER_ERROR", err.message);
          return new Response("handler error", { status: 500 });
        }
      }
      if (path.match(/^\/api\/admin\/orders\/(\d+)\/resend-payment-email$/) && method === "POST") {
        if (!await isAuthorized(request, env)) {
          return json2({ error: "Unauthorized" }, 401, cors);
        }
        const orderId = parseInt(path.split("/")[4], 10);
        const order = await env.DB.prepare(
          `SELECT o.*, c.email AS customer_email, c.name AS customer_name
             FROM orders o JOIN customers c ON o.customer_id = c.id
            WHERE o.id = ?`
        ).bind(orderId).first();
        if (!order) return json2({ error: "Order not found" }, 404, cors);
        if (order.payment_method !== "stripe") {
          return json2({ error: "This order is not a Stripe order" }, 400, cors);
        }
        if (order.payment_status === "paid") {
          return json2({ error: "Order already paid" }, 400, cors);
        }
        const itemsResult = await env.DB.prepare(
          `SELECT platform, service_type, service_variant, quantity, unit_price, total_price, target_url
             FROM order_items WHERE order_id = ?`
        ).bind(orderId).all();
        const items = (itemsResult.results || []).map((i) => ({
          platform: i.platform,
          serviceType: i.service_type,
          serviceVariant: i.service_variant,
          quantity: i.quantity,
          unitPrice: i.unit_price,
          totalPrice: i.total_price,
          targetUrl: i.target_url
        }));
        let stripeUrl = null;
        let sessionId = order.stripe_session_id;
        if (sessionId && order.stripe_payment_url) {
          if (sessionId.startsWith("plink_")) {
            stripeUrl = order.stripe_payment_url;
          } else {
            const existing = await retrieveStripeSession(env, sessionId);
            if (existing && existing.status === "open" && existing.url) {
              stripeUrl = existing.url;
            }
          }
        }
        if (!stripeUrl) {
          try {
            const siteOrigin = env.SITE_ORIGIN || "https://breakoutmusic.io";
            const newSession = await createStripePaymentLink(env, {
              orderId,
              orderNumber: order.order_number,
              customerEmail: order.customer_email,
              items,
              currency: order.currency || "USD",
              successUrl: `${siteOrigin}/success?order=${encodeURIComponent(order.order_number)}&session_id={CHECKOUT_SESSION_ID}`,
              cancelUrl: `${siteOrigin}/checkout?order=${encodeURIComponent(order.order_number)}&canceled=1`
            });
            stripeUrl = newSession.url;
            sessionId = newSession.id;
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
              newSession.expires_at ? new Date(newSession.expires_at * 1e3).toISOString() : null,
              orderId
            ).run();
          } catch (err) {
            console.error("STRIPE_RESEND_REGEN_FAILED", err.message);
            return json2({ error: "Failed to create new Stripe session: " + err.message }, 500, cors);
          }
        }
        ctx.waitUntil(sendStripePaymentEmail(env, {
          customerEmail: order.customer_email,
          orderNumber: order.order_number,
          createdAt: new Date(order.created_at || Date.now()).toLocaleDateString(
            "en-US",
            { year: "numeric", month: "long", day: "numeric" }
          ),
          items,
          subtotal: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
          total: order.total_amount,
          currencySymbol: (order.currency || "USD") === "USD" ? "$" : order.currency + " ",
          stripePaymentUrl: stripeUrl
        }));
        return json2({ ok: true, sessionId, paymentUrl: stripeUrl }, 200, cors);
      }
      if (path === "/api/geo" && method === "GET") {
        const country = request.cf && request.cf.country || request.headers.get("CF-IPCountry") || null;
        return json2({ country }, 200, cors);
      }
      if (path === "/api/cardinity/callback" && method === "POST") {
        const siteOrigin = env.SITE_ORIGIN || "https://breakoutmusic.io";
        const redirect = (loc) => new Response(null, { status: 303, headers: { Location: loc } });
        let cbFields;
        try {
          const form = await request.formData();
          cbFields = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
        } catch (err) {
          console.error("CARDINITY_CALLBACK_PARSE_ERROR", err.message);
          return redirect(`${siteOrigin}/checkout?cardinity_status=error`);
        }
        const cbOrderNumber = cbFields.order_id || "";
        const validSig = await verifyCardinityCallback(cbFields, env.CARDINITY_PROJECT_SECRET);
        if (!validSig) {
          console.warn("CARDINITY_CALLBACK_INVALID_SIG", cbOrderNumber);
          return redirect(`${siteOrigin}/checkout?cardinity_status=error&order=${encodeURIComponent(cbOrderNumber)}`);
        }
        console.log("CARDINITY_CALLBACK", cbFields.status, cbOrderNumber, cbFields.id);
        if (cbFields.status !== "approved") {
          return redirect(`${siteOrigin}/checkout?cardinity_status=declined&order=${encodeURIComponent(cbOrderNumber)}`);
        }
        try {
          const current = await env.DB.prepare(
            "SELECT id, payment_status FROM orders WHERE order_number = ?"
          ).bind(cbOrderNumber).first();
          if (!current) {
            console.warn("CARDINITY_CALLBACK_ORDER_NOT_FOUND", cbOrderNumber);
          } else if (current.payment_status !== "paid") {
            await env.DB.prepare(
              `UPDATE orders
                  SET payment_status = 'paid',
                      status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END,
                      updated_at = datetime('now')
                WHERE id = ?`
            ).bind(current.id).run();
            ctx.waitUntil((async () => {
              try {
                const order = await env.DB.prepare(
                  `SELECT o.order_number, o.total_amount, o.currency, o.created_at, c.email
                     FROM orders o JOIN customers c ON o.customer_id = c.id
                    WHERE o.id = ?`
                ).bind(current.id).first();
                const itemsResult = await env.DB.prepare(
                  `SELECT platform, service_type, service_variant, quantity, unit_price, target_url
                     FROM order_items WHERE order_id = ?`
                ).bind(current.id).all();
                const orderItems = (itemsResult.results || []).map((i) => ({
                  platform: i.platform,
                  serviceType: i.service_type,
                  serviceVariant: i.service_variant,
                  quantity: i.quantity,
                  unitPrice: i.unit_price,
                  targetUrl: i.target_url
                }));
                await sendOrderConfirmationEmail(env, order.email, order.order_number, orderItems, order.total_amount, order.currency || "USD");
                if (env.SHEETS_WEBHOOK_URL) {
                  const resp = await fetch(env.SHEETS_WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orderNumber: order.order_number,
                      date: (order.created_at || "").slice(0, 10),
                      email: order.email,
                      items: orderItems,
                      paymentMethod: "cardinity"
                    })
                  });
                  console.log("SHEETS_WEBHOOK_SENT_CARDINITY", order.order_number, resp.status);
                }
              } catch (e) {
                console.error("CARDINITY_POSTPAY_ERROR", e.message);
              }
            })());
          }
        } catch (err) {
          console.error("CARDINITY_CALLBACK_HANDLER_ERROR", err.message);
        }
        return redirect(`${siteOrigin}/success?order=${encodeURIComponent(cbOrderNumber)}&provider=cardinity`);
      }
      if (path === "/api/orders" && method === "POST") {
        const body = await request.json();
        const { email, name, items, paymentMethod, promoCode, billingCountry, vatId } = body;
        if (!email || !items || !items.length) {
          return json2({ error: "Email and items are required" }, 400, cors);
        }
        await env.DB.prepare(
          `INSERT INTO customers (email, name) VALUES (?, ?)
           ON CONFLICT(email) DO UPDATE SET name = COALESCE(?, name), updated_at = datetime('now')`
        ).bind(email, name || null, name || null).run();
        const customer = await env.DB.prepare(
          "SELECT id FROM customers WHERE email = ?"
        ).bind(email).first();
        let totalAmount = 0;
        for (const item of items) {
          totalAmount += item.quantity * item.unitPrice;
        }
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
        const subtotalBeforeDiscount = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
        const subtotalAfterDiscount = totalAmount;
        const vatCalc = calculateVat(subtotalAfterDiscount, billingCountry, vatId);
        totalAmount = Math.round((subtotalAfterDiscount + vatCalc.vatAmount) * 100) / 100;
        const tempNumber = "TEMP-" + Date.now();
        const orderResult = await env.DB.prepare(
          `INSERT INTO orders (customer_id, order_number, total_amount, currency, payment_method,
                               promo_code, promo_discount, subtotal,
                               tax_rate, tax_amount, billing_country)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          customer.id,
          tempNumber,
          totalAmount,
          body.currency || "USD",
          paymentMethod || "stripe",
          appliedPromoCode || null,
          promoDiscountAmount || 0,
          subtotalBeforeDiscount,
          vatCalc.vatRate || 0,
          vatCalc.vatAmount || 0,
          billingCountry || null
        ).run();
        const orderNumber = `BRK-${1e3 + orderResult.meta.last_row_id}`;
        await env.DB.prepare("UPDATE orders SET order_number = ? WHERE id = ?").bind(orderNumber, orderResult.meta.last_row_id).run();
        const orderId = orderResult.meta.last_row_id;
        if (appliedPromoCode) {
          await env.DB.prepare(
            `UPDATE promo_codes SET uses_count = uses_count + 1, total_discount_given = total_discount_given + ? WHERE LOWER(code) = LOWER(?)`
          ).bind(promoDiscountAmount, appliedPromoCode).run();
        }
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
        await env.DB.prepare(
          `UPDATE abandoned_checkouts
           SET recovered = 1, recovered_at = datetime('now'), recovered_order_number = ?
           WHERE LOWER(email) = LOWER(?) AND recovered = 0`
        ).bind(orderNumber, email).run();
        console.log("ABOUT_TO_SEND_EMAIL", email, orderNumber, paymentMethod);
        if (paymentMethod === "stripe") {
          try {
            const siteOrigin = env.SITE_ORIGIN || "https://breakoutmusic.io";
            const session = await createStripePaymentLink(env, {
              orderId,
              orderNumber,
              customerEmail: email,
              items: items.map((i) => ({
                platform: i.platform,
                serviceType: i.serviceType,
                serviceVariant: i.serviceVariant,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                targetUrl: i.targetUrl
              })),
              currency: body.currency || "USD",
              promoDiscount: promoDiscountAmount,
              promoCode: appliedPromoCode,
              vatAmount: vatCalc.vatAmount,
              vatRate: vatCalc.vatRate,
              billingCountry,
              vatId,
              successUrl: `${siteOrigin}/success?order=${encodeURIComponent(orderNumber)}&session_id={CHECKOUT_SESSION_ID}`,
              cancelUrl: `${siteOrigin}/checkout?order=${encodeURIComponent(orderNumber)}&canceled=1`
            });
            await env.DB.prepare(
              `UPDATE orders SET stripe_session_id = ?, stripe_payment_url = ?, stripe_payment_intent = ?,
                                 stripe_session_expires_at = ?
               WHERE id = ?`
            ).bind(
              session.id,
              session.url,
              session.payment_intent || null,
              session.expires_at ? new Date(session.expires_at * 1e3).toISOString() : null,
              orderId
            ).run();
            const EU_COUNTRY_NAMES = { AT: "Austria", BE: "Belgium", BG: "Bulgaria", HR: "Croatia", CY: "Cyprus", CZ: "Czech Republic", DK: "Denmark", EE: "Estonia", FI: "Finland", FR: "France", DE: "Germany", GR: "Greece", HU: "Hungary", IE: "Ireland", IT: "Italy", LV: "Latvia", LT: "Lithuania", LU: "Luxembourg", MT: "Malta", NL: "Netherlands", PL: "Poland", PT: "Portugal", RO: "Romania", SK: "Slovakia", SI: "Slovenia", SE: "Sweden", ES: "Spain" };
            ctx.waitUntil(sendStripePaymentEmail(env, {
              customerEmail: email,
              orderNumber,
              createdAt: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
              items: items.map((i) => ({
                platform: i.platform,
                serviceType: i.serviceType,
                serviceVariant: i.serviceVariant,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                targetUrl: i.targetUrl,
                totalPrice: i.unitPrice * i.quantity
              })),
              subtotal: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
              promoCode: appliedPromoCode,
              promoDiscount: promoDiscountAmount || 0,
              taxPrice: vatCalc.vatAmount || 0,
              taxRate: vatCalc.vatRate || 0,
              billingCountryName: billingCountry ? EU_COUNTRY_NAMES[billingCountry] || billingCountry : null,
              vatReverseCharge: vatCalc.reverseCharge,
              customerVatId: vatId || null,
              total: totalAmount,
              currencySymbol: (body.currency || "USD") === "USD" ? "$" : body.currency + " ",
              stripePaymentUrl: session.url
            }));
            return json2({
              success: true,
              order: { id: orderId, orderNumber, totalAmount, currency: body.currency || "USD" },
              stripe: { sessionId: session.id, paymentUrl: session.url }
            }, 201, cors);
          } catch (err) {
            console.error("STRIPE_SESSION_FAILED", err.message);
            ctx.waitUntil(sendOrderConfirmationEmail(env, email, orderNumber, items, totalAmount, body.currency || "USD"));
            return json2({
              success: true,
              order: { id: orderId, orderNumber, totalAmount, currency: body.currency || "USD" },
              stripe: { error: "Could not create Stripe payment session. Our team will contact you with payment instructions." }
            }, 201, cors);
          }
        }
        if (paymentMethod === "hipay") {
          try {
            if (!body.hipayCardToken) {
              throw new Error("Missing hipayCardToken from Hosted Fields");
            }
            const siteOrigin = env.SITE_ORIGIN || "https://breakoutmusic.io";
            const ipAddress = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "0.0.0.0";
            const userAgent = request.headers.get("User-Agent") || "Mozilla/5.0";
            const _holder = String(body.hipayCardHolder || "").trim();
            const _holderParts = _holder ? _holder.split(/\s+/) : [];
            const _firstname = body.firstname || _holderParts[0] || "Customer";
            const _lastname = body.lastname || _holderParts.slice(1).join(" ") || _holderParts[0] || "Customer";
            const hipayResult = await createHipayOrder(env, {
              orderId,
              orderNumber,
              amount: totalAmount,
              currency: body.currency || "USD",
              customerEmail: email,
              firstname: _firstname,
              lastname: _lastname,
              cardToken: body.hipayCardToken,
              paymentProduct: body.hipayPaymentProduct || "visa",
              vatAmount: vatCalc.vatAmount || 0,
              vatRate: vatCalc.vatRate || 0,
              billingCountry,
              streetAddress: body.streetAddress || null,
              city: body.city || null,
              zipcode: body.zipcode || null,
              ipAddress,
              userAgent,
              acceptHeader: request.headers.get("Accept") || "text/html",
              browser: body.browser || {},
              items,
              acceptUrl: `${siteOrigin}/success?order=${encodeURIComponent(orderNumber)}&provider=hipay`,
              declineUrl: `${siteOrigin}/checkout?order=${encodeURIComponent(orderNumber)}&hipay_status=declined`,
              pendingUrl: `${siteOrigin}/success?order=${encodeURIComponent(orderNumber)}&provider=hipay&pending=1`,
              exceptionUrl: `${siteOrigin}/checkout?order=${encodeURIComponent(orderNumber)}&hipay_status=error`,
              cancelUrl: `${siteOrigin}/checkout?order=${encodeURIComponent(orderNumber)}&hipay_status=canceled`,
              notifyUrl: `${new URL(request.url).origin}/api/webhooks/hipay`
            });
            await env.DB.prepare(
              `UPDATE orders SET hipay_transaction_ref = ?, hipay_forward_url = ?,
                                  updated_at = datetime('now')
                WHERE id = ?`
            ).bind(
              hipayResult.transactionReference || null,
              hipayResult.forwardUrl || null,
              orderId
            ).run();
            if (hipayResult.state === "completed") {
              await env.DB.prepare(
                `UPDATE orders SET payment_status = 'paid',
                                    status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END
                  WHERE id = ?`
              ).bind(orderId).run();
            }
            return json2({
              success: true,
              order: { id: orderId, orderNumber, totalAmount, currency: body.currency || "USD" },
              hipay: {
                state: hipayResult.state,
                transactionReference: hipayResult.transactionReference,
                forwardUrl: hipayResult.forwardUrl || null
              }
            }, 201, cors);
          } catch (err) {
            console.error("HIPAY_ORDER_FAILED", err.message);
            return json2({
              success: false,
              order: { id: orderId, orderNumber, totalAmount, currency: body.currency || "USD" },
              error: "HiPay payment failed: " + err.message
            }, 400, cors);
          }
        }
        if (paymentMethod === "cardinity") {
          try {
            if (!env.CARDINITY_PROJECT_ID || !env.CARDINITY_PROJECT_SECRET) {
              throw new Error("Cardinity is not configured");
            }
            const siteOrigin = env.SITE_ORIGIN || "https://breakoutmusic.io";
            const apiOrigin = new URL(request.url).origin;
            const desc = items.map((i) => `${i.quantity}x ${i.serviceType}`).join(", ").slice(0, 255);
            const cFields = {
              amount: totalAmount.toFixed(2),
              currency: body.currency || "USD",
              country: billingCountry || "US",
              order_id: orderNumber,
              description: desc,
              email_address: email,
              project_id: env.CARDINITY_PROJECT_ID,
              return_url: `${apiOrigin}/api/cardinity/callback`,
              cancel_url: `${siteOrigin}/checkout?cardinity_status=canceled&order=${encodeURIComponent(orderNumber)}`
            };
            cFields.signature = await cardinitySign(cFields, env.CARDINITY_PROJECT_SECRET);
            return json2({
              success: true,
              order: { id: orderId, orderNumber, totalAmount, currency: body.currency || "USD" },
              cardinity: { action: CARDINITY_CHECKOUT_URL, fields: cFields }
            }, 201, cors);
          } catch (err) {
            console.error("CARDINITY_ORDER_FAILED", err.message);
            return json2({
              success: false,
              order: { id: orderId, orderNumber, totalAmount, currency: body.currency || "USD" },
              error: "Cardinity payment failed: " + err.message
            }, 400, cors);
          }
        }
        const _emailFn = paymentMethod === "paypal" ? sendPayPalInstructionsEmail : sendOrderConfirmationEmail;
        ctx.waitUntil(_emailFn(env, email, orderNumber, items, totalAmount, body.currency || "USD"));
        return json2({
          success: true,
          order: { id: orderId, orderNumber, totalAmount, currency: body.currency || "USD" }
        }, 201, cors);
      }
      if (path.startsWith("/api/orders/") && method === "GET" && !path.includes("/admin")) {
        const orderNumber = path.split("/api/orders/")[1];
        const order = await env.DB.prepare(
          `SELECT o.*, c.email, c.name as customer_name
           FROM orders o JOIN customers c ON o.customer_id = c.id
           WHERE o.order_number = ?`
        ).bind(orderNumber).first();
        if (!order) return json2({ error: "Order not found" }, 404, cors);
        const items = await env.DB.prepare(
          "SELECT * FROM order_items WHERE order_id = ?"
        ).bind(order.id).all();
        return json2({ order: { ...order, items: items.results } }, 200, cors);
      }
      if (path === "/api/subscribe" && method === "POST") {
        const body = await request.json();
        if (!body.email) return json2({ error: "Email is required" }, 400, cors);
        await env.DB.prepare(
          `INSERT INTO subscribers (email, name, source) VALUES (?, ?, ?)
           ON CONFLICT(email) DO UPDATE SET subscribed = 1, name = COALESCE(?, name)`
        ).bind(body.email, body.name || null, body.source || "website", body.name || null).run();
        return json2({ success: true, message: "Subscribed successfully" }, 201, cors);
      }
      if (path === "/api/unsubscribe" && method === "POST") {
        const body = await request.json();
        if (!body.email) return json2({ error: "Email is required" }, 400, cors);
        await env.DB.prepare(
          "UPDATE subscribers SET subscribed = 0 WHERE email = ?"
        ).bind(body.email).run();
        return json2({ success: true, message: "Unsubscribed" }, 200, cors);
      }
      if (path === "/api/auth/register" && method === "POST") return handleRegister(request, env, cors);
      if (path === "/api/auth/login" && method === "POST") return handleLogin(request, env, cors);
      if (path === "/api/auth/me" && method === "GET") return handleMe(request, env, cors);
      if (path === "/api/auth/forgot-password" && method === "POST") return handleForgotPassword(request, env, ctx, cors);
      if (path === "/api/auth/reset-password" && method === "POST") return handleResetPassword(request, env, cors);
      if (path === "/api/auth/change-password" && method === "POST") return handleChangePassword(request, env, cors);
      if (path.startsWith("/api/admin")) {
        if (!await isAuthorized(request, env)) {
          return json2({ error: "Unauthorized" }, 401, cors);
        }
        if (path === "/api/admin/change-password" && method === "POST") {
          const body = await request.json().catch(() => ({}));
          const { currentPassword, newPassword } = body;
          if (!currentPassword || !newPassword) {
            return json2({ error: "Both passwords required." }, 400, cors);
          }
          if (newPassword.length < 8) {
            return json2({ error: "New password must be at least 8 characters." }, 400, cors);
          }
          if (currentPassword === newPassword) {
            return json2({ error: "New password must differ from current." }, 400, cors);
          }
          const headerPw = request.headers.get("Authorization").slice(7);
          if (headerPw !== currentPassword) {
            return json2({ error: "Current password mismatch." }, 401, cors);
          }
          const { hash, salt } = await hashPassword(newPassword);
          await env.DB.prepare(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('admin_password_hash', ?, datetime('now'))"
          ).bind(hash).run();
          await env.DB.prepare(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('admin_password_salt', ?, datetime('now'))"
          ).bind(salt).run();
          return json2({ success: true }, 200, cors);
        }
        if (path === "/api/admin/abandoned-checkouts" && method === "GET") {
          const filter = url.searchParams.get("filter") || "all";
          const days = parseInt(url.searchParams.get("days") || "30", 10);
          let where = `created_at >= datetime('now', '-${days} days')`;
          if (filter === "recovered") where += " AND recovered = 1";
          if (filter === "open") where += " AND recovered = 0";
          const rows = await env.DB.prepare(
            `SELECT id, email, items_json, subtotal, promo_code, recovered, recovered_at, recovered_order_number, email_sent_at, created_at, updated_at
             FROM abandoned_checkouts WHERE ${where} ORDER BY updated_at DESC LIMIT 200`
          ).all();
          const items = (rows.results || []).map((r) => ({ ...r, items: r.items_json ? JSON.parse(r.items_json) : [] }));
          return json2({ abandoned: items }, 200, cors);
        }
        if (path === "/api/admin/analytics" && method === "GET") {
          const period = url.searchParams.get("period") || "30";
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
              GROUP BY oi.service_type, oi.platform ORDER BY revenue DESC LIMIT 10`).all()
          ]);
          return json2({
            period: days,
            orders_count: ordersStats.count,
            paid_revenue: revenueStats.paid_revenue,
            pending_revenue: revenueStats.pending_revenue,
            paid_count: revenueStats.paid_count,
            unpaid_count: revenueStats.unpaid_count,
            aov: revenueStats.aov,
            promo_codes: promoStats.results,
            top_products: topProducts.results
          }, 200, cors);
        }
        if (path === "/api/admin/orders" && method === "GET") {
          const status = url.searchParams.get("status");
          const page = parseInt(url.searchParams.get("page") || "1");
          const limit = parseInt(url.searchParams.get("limit") || "50");
          const offset = (page - 1) * limit;
          let query = `SELECT o.*, c.email, c.name as customer_name
                       FROM orders o JOIN customers c ON o.customer_id = c.id`;
          let countQuery = "SELECT COUNT(*) as total FROM orders o";
          const params = [];
          if (status) {
            query += " WHERE o.status = ?";
            countQuery += " WHERE o.status = ?";
            params.push(status);
          }
          query += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
          const [orders, count] = await Promise.all([
            env.DB.prepare(query).bind(...params, limit, offset).all(),
            env.DB.prepare(countQuery).bind(...params).first()
          ]);
          return json2({
            orders: orders.results,
            pagination: { page, limit, total: count.total, pages: Math.ceil(count.total / limit) }
          }, 200, cors);
        }
        if (path.match(/^\/api\/admin\/orders\/\d+$/) && method === "GET") {
          const orderId = path.split("/").pop();
          const order = await env.DB.prepare(
            `SELECT o.*, c.email, c.name as customer_name
             FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ?`
          ).bind(orderId).first();
          if (!order) return json2({ error: "Order not found" }, 404, cors);
          const items = await env.DB.prepare(
            "SELECT * FROM order_items WHERE order_id = ?"
          ).bind(orderId).all();
          return json2({ order: { ...order, items: items.results } }, 200, cors);
        }
        if (path.match(/^\/api\/admin\/orders\/\d+$/) && method === "PUT") {
          const orderId = path.split("/").pop();
          const body = await request.json();
          const currentOrder = await env.DB.prepare(
            "SELECT payment_status FROM orders WHERE id = ?"
          ).bind(orderId).first();
          if (!currentOrder) return json2({ error: "Order not found" }, 404, cors);
          const updates = [];
          const values = [];
          if (body.status) {
            updates.push("status = ?");
            values.push(body.status);
          }
          if (body.payment_status) {
            updates.push("payment_status = ?");
            values.push(body.payment_status);
          }
          if (body.fulfillment_status) {
            updates.push("fulfillment_status = ?");
            values.push(body.fulfillment_status);
          }
          if (body.notes !== void 0) {
            updates.push("notes = ?");
            values.push(body.notes);
          }
          if (updates.length === 0) return json2({ error: "No fields to update" }, 400, cors);
          updates.push("updated_at = datetime('now')");
          values.push(orderId);
          await env.DB.prepare(
            `UPDATE orders SET ${updates.join(", ")} WHERE id = ?`
          ).bind(...values).run();
          if (body.payment_status === "paid" && currentOrder.payment_status !== "paid" && env.SHEETS_WEBHOOK_URL) {
            ctx.waitUntil((async () => {
              try {
                const order = await env.DB.prepare(
                  `SELECT o.order_number, o.created_at, c.email
                   FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ?`
                ).bind(orderId).first();
                const itemsResult = await env.DB.prepare(
                  "SELECT platform, service_type, service_variant, quantity, target_url FROM order_items WHERE order_id = ?"
                ).bind(orderId).all();
                const items = (itemsResult.results || []).map((i) => ({
                  platform: i.platform,
                  serviceType: i.service_type,
                  serviceVariant: i.service_variant,
                  quantity: i.quantity,
                  targetUrl: i.target_url
                }));
                const resp = await fetch(env.SHEETS_WEBHOOK_URL, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderNumber: order.order_number,
                    date: (order.created_at || "").slice(0, 10),
                    email: order.email,
                    items
                  })
                });
                console.log("SHEETS_WEBHOOK_SENT", order.order_number, resp.status);
              } catch (e) {
                console.error("SHEETS_WEBHOOK_ERROR", e.message);
              }
            })());
          }
          return json2({ success: true }, 200, cors);
        }
        if (path === "/api/admin/customers" && method === "GET") {
          const page = parseInt(url.searchParams.get("page") || "1");
          const limit = parseInt(url.searchParams.get("limit") || "50");
          const offset = (page - 1) * limit;
          const [customers, count] = await Promise.all([
            env.DB.prepare(
              `SELECT c.*, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
               FROM customers c LEFT JOIN orders o ON c.id = o.customer_id
               GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`
            ).bind(limit, offset).all(),
            env.DB.prepare("SELECT COUNT(*) as total FROM customers").first()
          ]);
          return json2({
            customers: customers.results,
            pagination: { page, limit, total: count.total, pages: Math.ceil(count.total / limit) }
          }, 200, cors);
        }
        if (path === "/api/admin/subscribers" && method === "GET") {
          const subscribers = await env.DB.prepare(
            "SELECT * FROM subscribers ORDER BY created_at DESC"
          ).all();
          return json2({ subscribers: subscribers.results }, 200, cors);
        }
        if (path === "/api/admin/stats" && method === "GET") {
          const [totalOrders, revenue, pendingOrders, totalCustomers, totalSubscribers] = await Promise.all([
            env.DB.prepare("SELECT COUNT(*) as count FROM orders").first(),
            env.DB.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid'").first(),
            env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").first(),
            env.DB.prepare("SELECT COUNT(*) as count FROM customers").first(),
            env.DB.prepare("SELECT COUNT(*) as count FROM subscribers WHERE subscribed = 1").first()
          ]);
          const recentOrders = await env.DB.prepare(
            `SELECT o.*, c.email FROM orders o JOIN customers c ON o.customer_id = c.id
             ORDER BY o.created_at DESC LIMIT 10`
          ).all();
          return json2({
            stats: {
              totalOrders: totalOrders.count,
              revenue: revenue.total,
              pendingOrders: pendingOrders.count,
              totalCustomers: totalCustomers.count,
              totalSubscribers: totalSubscribers.count
            },
            recentOrders: recentOrders.results
          }, 200, cors);
        }
      }
      return json2({ error: "Not found" }, 404, cors);
    } catch (err) {
      console.error("API Error:", err);
      return json2({ error: "Internal server error", message: err.message }, 500, cors);
    }
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
