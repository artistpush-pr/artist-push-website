/* ============================================
   Breakout — Email Capture UI
   Exit-intent popup, footer form, cart email
   ============================================ */

(function() {
  'use strict';

  const EmailCapture = {

    /* ── Anti-bot helpers ── */
    _formTimestamps: new Map(),
    _isBot(formId) {
      // Check honeypot field
      const hp = document.querySelector(`#${formId} .ap-hp-field`);
      if (hp && hp.value) return true;
      // Check timing (form filled in <2 seconds = likely bot)
      const ts = this._formTimestamps.get(formId);
      if (ts && (Date.now() - ts) < 2000) return true;
      return false;
    },
    _validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254 && !/[<>"']/.test(email);
    },
    _honeypotHtml() {
      // Hidden field that bots auto-fill but real users don't see
      return '<input class="ap-hp-field" type="text" name="website_url" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;opacity:0;height:0;width:0;">';
    },

    /* ── Exit-Intent Popup ── */
    initExitPopup() {
      // Don't show if already subscribed or dismissed this session
      if (localStorage.getItem('ap_subscriber') || sessionStorage.getItem('exit_popup_shown')) return;
      // Один відвідувач — один код: тримачам будь-якого кода знижку не пропонуємо
      try {
        if (sessionStorage.getItem('bo_promo') || sessionStorage.getItem('active_promo')) return;
        const lp = JSON.parse(localStorage.getItem('breakout_promo') || 'null');
        if (lp && lp.code && (!lp.exp || Date.now() < lp.exp)) return;
      } catch (err) {}

      // Create popup HTML
      const overlay = document.createElement('div');
      overlay.className = 'email-popup-overlay';
      overlay.id = 'exitPopup';
      overlay.innerHTML = `
        <div class="email-popup">
          <button class="email-popup-close" onclick="document.getElementById('exitPopup').classList.remove('active')">&times;</button>
          <div class="email-popup-badge">Exclusive Offer</div>
          <h3>Get <span>10% OFF</span></h3>
          <p>Subscribe to get exclusive deals, promotion tips, and early access to new services.</p>
          <form class="email-popup-form" id="exitPopupForm">
            ${this._honeypotHtml()}
            <input type="email" class="email-popup-input" placeholder="Your email address" required>
            <button type="submit" class="email-popup-submit">Subscribe</button>
          </form>
          <div class="email-popup-note">No spam. Unsubscribe anytime.</div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Exit intent detection
      let triggered = false;
      document.addEventListener('mouseout', (e) => {
        if (e.clientY < 5 && !triggered && !sessionStorage.getItem('exit_popup_shown')) {
          triggered = true;
          setTimeout(() => {
            overlay.classList.add('active');
            sessionStorage.setItem('exit_popup_shown', '1');
          }, 300);
        }
      });

      // Mobile (audit M10): no mouse to leave with, so instead of a dumb
      // 45s timer we wait until the visitor has seen 60% of the page and
      // then scrolls UP — a natural "I'm done here" signal.
      let deepEnough = false;
      let lastY = window.scrollY;
      const onScroll = () => {
        if (triggered || sessionStorage.getItem('exit_popup_shown') || localStorage.getItem('ap_subscriber')) {
          window.removeEventListener('scroll', onScroll);
          return;
        }
        const doc = document.documentElement;
        const depth = (window.scrollY + window.innerHeight) / doc.scrollHeight;
        if (depth >= 0.6) deepEnough = true;
        if (deepEnough && window.scrollY < lastY - 40) {
          triggered = true;
          overlay.classList.add('active');
          sessionStorage.setItem('exit_popup_shown', '1');
          window.removeEventListener('scroll', onScroll);
        }
        lastY = window.scrollY;
      };
      window.addEventListener('scroll', onScroll, { passive: true });

      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });

      // Record form render time for anti-bot timing check
      this._formTimestamps.set('exitPopupForm', Date.now());

      // Form submit
      document.getElementById('exitPopupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (this._isBot('exitPopupForm')) return; // Silent reject bots
        const input = e.target.querySelector('input[type="email"]');
        const email = input.value.trim();
        if (email && this._validateEmail(email) && window.AP_EMAIL) {
          window.AP_EMAIL.saveSubscriber(email, 'exit_popup');
          window.AP_EMAIL.addTag('discount_10pct');
          // Audit M10: the code is shown right here, not "check your inbox"
          // (no automation ever sent it). It also self-applies at checkout.
          try {
            sessionStorage.setItem('active_promo', 'WELCOME10');
            sessionStorage.setItem('bo_promo', 'WELCOME10');
            localStorage.setItem('breakout_promo', JSON.stringify({ code: 'WELCOME10' }));
            sessionStorage.setItem('promo_closed', '1');
          } catch (err) {}
          const pb = document.getElementById('promoBar');
          if (pb) pb.classList.add('hidden');
          e.target.innerHTML = '<div class="email-popup-success">You\'re in! Your 10% code:</div>' +
            '<div class="email-popup-code"><strong>WELCOME10</strong>' +
            '<button type="button" class="email-popup-copy" onclick="navigator.clipboard.writeText(\'WELCOME10\'); this.textContent=\'Copied!\';">Copy</button></div>' +
            '<div class="email-popup-note">Applied automatically at checkout.</div>';
          setTimeout(() => overlay.classList.remove('active'), 6000);
        }
      });
    },

    /* ── Footer Newsletter Form ── */
    initFooterForms() {
      document.querySelectorAll('.footer-newsletter-form').forEach((form, i) => {
        // Add honeypot field
        const hp = document.createElement('input');
        hp.className = 'ap-hp-field';
        hp.type = 'text';
        hp.name = 'website_url';
        hp.tabIndex = -1;
        hp.autocomplete = 'off';
        hp.style.cssText = 'position:absolute;left:-9999px;opacity:0;height:0;width:0;';
        form.prepend(hp);

        const formId = `footerForm_${i}`;
        form.id = formId;
        this._formTimestamps.set(formId, Date.now());

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          // Anti-bot check
          if (hp.value) return;
          const input = form.querySelector('input[type="email"]');
          const email = input.value.trim();
          if (email && this._validateEmail(email) && window.AP_EMAIL) {
            window.AP_EMAIL.saveSubscriber(email, 'footer_newsletter');
            window.AP_EMAIL.addTag('newsletter');
            const success = document.createElement('div');
            success.className = 'footer-newsletter-success';
            success.textContent = 'Subscribed! Welcome aboard.';
            form.replaceWith(success);
          }
        });
      });
    },

    /* ── Cart Email Capture (after add to cart, ask for email if not subscribed) ── */
    initCartEmailCapture() {
      // Hook into Cart.addItem if available
      const originalAddItem = window.Cart?.addItem;
      if (originalAddItem) {
        window.Cart.addItem = function(...args) {
          const result = originalAddItem.apply(Cart, args);

          // Track in email system — args[0] is the item object {id, name, price, quantity, ...}
          if (window.AP_EMAIL && args[0]) {
            const item = args[0];
            window.AP_EMAIL.trackAddToCart({ name: item.name, price: item.price, quantity: item.quantity || 1 });
          }

          // Show email capture if not subscribed (after 2nd add to cart)
          const cartItems = JSON.parse(localStorage.getItem('artistpush_cart')) || [];
          if (cartItems.length >= 2 && !localStorage.getItem('ap_subscriber') && !sessionStorage.getItem('cart_email_asked')) {
            sessionStorage.setItem('cart_email_asked', '1');
            EmailCapture.showCartEmailPrompt();
          }

          return result;
        };
      }
    },

    showCartEmailPrompt() {
      const overlay = document.createElement('div');
      overlay.className = 'email-popup-overlay active';
      overlay.id = 'cartEmailPopup';
      overlay.innerHTML = `
        <div class="email-popup">
          <button class="email-popup-close" onclick="document.getElementById('cartEmailPopup').classList.remove('active')">&times;</button>
          <div class="email-popup-badge">Save Your Cart</div>
          <h3>Never Lose <span>Your Order</span></h3>
          <p>Enter your email and we'll save your cart. Plus, get order updates and exclusive deals.</p>
          <form class="email-popup-form" id="cartEmailForm">
            ${EmailCapture._honeypotHtml()}
            <input type="email" class="email-popup-input" placeholder="Your email address" required>
            <button type="submit" class="email-popup-submit">Save Cart</button>
          </form>
          <div class="email-popup-note">We'll email your cart if you don't complete checkout.</div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });

      this._formTimestamps.set('cartEmailForm', Date.now());

      document.getElementById('cartEmailForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (this._isBot('cartEmailForm')) return;
        const email = e.target.querySelector('input[type="email"]').value.trim();
        if (email && this._validateEmail(email) && window.AP_EMAIL) {
          window.AP_EMAIL.saveSubscriber(email, 'cart_save');
          window.AP_EMAIL.addTag('cart_saver');
          e.target.innerHTML = '<div class="email-popup-success">Cart saved! We\'ll keep it safe for you.</div>';
          setTimeout(() => overlay.classList.remove('active'), 2500);
        }
      });
    },

    /* ── Checkout Email Tracking ── */
    initCheckoutTracking() {
      if (!window.location.pathname.includes('checkout')) return;

      const emailField = document.querySelector('input[type="email"], input[name="email"], #checkout-email');
      if (emailField) {
        emailField.addEventListener('blur', () => {
          const email = emailField.value.trim();
          if (email && EmailCapture._validateEmail(email) && window.AP_EMAIL) {
            window.AP_EMAIL.trackCheckoutStart(email);
          }
        });
      }
    },

    /* ── Init All ── */
    init() {
      this.initExitPopup();
      this.initFooterForms();
      this.initCartEmailCapture();
      this.initCheckoutTracking();
    }
  };

  window.EmailCapture = EmailCapture;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EmailCapture.init());
  } else {
    EmailCapture.init();
  }
})();
