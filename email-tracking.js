/* ============================================
   ARTIST PUSH — Email Automation Data Layer
   Tracks user events for email automation flows:
   - Page views & category browsing
   - Cart actions (add, remove, abandon)
   - Checkout intent
   - Email collection

   Ready to connect to: Klaviyo, Mailchimp, Brevo, or any ESP
   ============================================ */

(function() {
  'use strict';

  const AP_EMAIL = {
    storageKey: 'ap_subscriber',
    eventsKey: 'ap_events',
    cartKey: 'ap_cart_snapshot',
    sessionKey: 'ap_session',

    /* ── Subscriber Management ── */
    getSubscriber() {
      try { return JSON.parse(localStorage.getItem(this.storageKey)) || null; }
      catch { return null; }
    },

    saveSubscriber(email, source) {
      const existing = this.getSubscriber();
      const subscriber = {
        email: email.trim().toLowerCase(),
        source: source || 'unknown',
        firstSeen: existing?.firstSeen || new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        visits: (existing?.visits || 0) + (existing?.email === email.trim().toLowerCase() ? 0 : 1),
        tags: existing?.tags || []
      };
      localStorage.setItem(this.storageKey, JSON.stringify(subscriber));
      this.trackEvent('email_collected', { email: subscriber.email, source });
      this._sendToESP('subscribe', subscriber);
      return subscriber;
    },

    addTag(tag) {
      const sub = this.getSubscriber();
      if (sub && !sub.tags.includes(tag)) {
        sub.tags.push(tag);
        localStorage.setItem(this.storageKey, JSON.stringify(sub));
      }
    },

    /* ── Event Tracking ── */
    trackEvent(eventName, data) {
      const events = this.getEvents();
      const event = {
        event: eventName,
        data: data || {},
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer
      };
      events.push(event);
      // Keep last 100 events
      if (events.length > 100) events.splice(0, events.length - 100);
      localStorage.setItem(this.eventsKey, JSON.stringify(events));

      // Send to ESP if connected
      this._sendToESP('track', event);

      return event;
    },

    getEvents() {
      try { return JSON.parse(localStorage.getItem(this.eventsKey)) || []; }
      catch { return []; }
    },

    /* ── Session Tracking ── */
    initSession() {
      let session = null;
      try { session = JSON.parse(sessionStorage.getItem(this.sessionKey)); } catch {}

      if (!session) {
        session = {
          id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          started: new Date().toISOString(),
          pages: [],
          cartActions: [],
          categoriesViewed: [],
          source: new URLSearchParams(window.location.search).get('utm_source') || document.referrer || 'direct'
        };
      }

      // Track page view
      const page = window.location.pathname;
      if (!session.pages.includes(page)) session.pages.push(page);
      session.lastActive = new Date().toISOString();
      session.pageCount = (session.pageCount || 0) + 1;

      sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
      this.trackEvent('page_view', { page, title: document.title });

      return session;
    },

    getSession() {
      try { return JSON.parse(sessionStorage.getItem(this.sessionKey)) || null; }
      catch { return null; }
    },

    /* ── Category / Service Browsing ── */
    trackCategoryView(category) {
      const session = this.getSession();
      if (session && !session.categoriesViewed.includes(category)) {
        session.categoriesViewed.push(category);
        sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
      }
      this.trackEvent('category_viewed', { category });
    },

    /* ── Cart Tracking ── */
    trackAddToCart(item) {
      this.trackEvent('add_to_cart', item);
      this._snapshotCart();

      const session = this.getSession();
      if (session) {
        session.cartActions.push({ action: 'add', item: item.name, time: new Date().toISOString() });
        sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
      }
    },

    trackRemoveFromCart(item) {
      this.trackEvent('remove_from_cart', item);
      this._snapshotCart();
    },

    trackCartAbandonment() {
      const cart = this._getCartItems();
      if (cart && cart.length > 0) {
        const subscriber = this.getSubscriber();
        this.trackEvent('cart_abandoned', {
          items: cart,
          total: this._getCartTotal(),
          email: subscriber?.email || null
        });
        this._sendToESP('abandoned_cart', {
          email: subscriber?.email,
          items: cart,
          total: this._getCartTotal(),
          abandonedAt: new Date().toISOString()
        });
      }
    },

    _snapshotCart() {
      const cart = this._getCartItems();
      localStorage.setItem(this.cartKey, JSON.stringify({
        items: cart,
        total: this._getCartTotal(),
        updatedAt: new Date().toISOString()
      }));
    },

    _getCartItems() {
      try {
        const cart = JSON.parse(localStorage.getItem('cart'));
        return cart?.items || [];
      } catch { return []; }
    },

    _getCartTotal() {
      try {
        const cart = JSON.parse(localStorage.getItem('cart'));
        return cart?.items?.reduce((sum, i) => sum + (i.price * i.qty), 0) || 0;
      } catch { return 0; }
    },

    /* ── Checkout Tracking ── */
    trackCheckoutStart(email) {
      this.trackEvent('checkout_started', {
        email,
        items: this._getCartItems(),
        total: this._getCartTotal()
      });
      if (email) {
        this.saveSubscriber(email, 'checkout');
        this.addTag('checkout_started');
      }
    },

    trackPurchaseComplete(orderData) {
      this.trackEvent('purchase_complete', orderData);
      const sub = this.getSubscriber();
      if (sub) {
        this.addTag('customer');
        this._sendToESP('purchase', { ...orderData, email: sub.email });
      }
      // Clear cart snapshot
      localStorage.removeItem(this.cartKey);
    },

    /* ── ESP Integration Layer ── */
    // This is the hook where you connect your email service
    // Replace the console.log with actual API calls when ready
    _sendToESP(action, data) {
      // ╔═══════════════════════════════════════════╗
      // ║  CONNECT YOUR EMAIL SERVICE HERE          ║
      // ║                                           ║
      // ║  Klaviyo:                                  ║
      // ║    _learnq.push(['track', action, data])  ║
      // ║                                           ║
      // ║  Mailchimp:                                ║
      // ║    fetch('/api/mailchimp', {body: data})   ║
      // ║                                           ║
      // ║  Brevo:                                    ║
      // ║    sendinblue.track(action, data)          ║
      // ╚═══════════════════════════════════════════╝

      if (window.AP_ESP_HANDLER && typeof window.AP_ESP_HANDLER === 'function') {
        window.AP_ESP_HANDLER(action, data);
      }

      // Debug mode
      if (window.AP_DEBUG) {
        console.log('[AP Email]', action, data);
      }
    },

    /* ── Abandoned Cart Detection ── */
    startAbandonmentTimer() {
      // Check for cart abandonment when user leaves
      window.addEventListener('beforeunload', () => {
        const cart = this._getCartItems();
        if (cart.length > 0) {
          this.trackCartAbandonment();
        }
      });

      // Also check on visibility change (tab switch)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          const cart = this._getCartItems();
          if (cart.length > 0) {
            this._snapshotCart();
          }
        }
      });
    },

    /* ── Category Detection (auto) ── */
    autoTrackCategory() {
      const path = window.location.pathname;
      if (path.includes('spotify')) this.trackCategoryView('spotify');
      else if (path.includes('soundcloud')) this.trackCategoryView('soundcloud');
      else if (path.includes('blog')) this.trackCategoryView('blog');
      else if (path.includes('cart')) this.trackCategoryView('cart');
      else if (path.includes('checkout')) this.trackCategoryView('checkout');
    },

    /* ── Init ── */
    init() {
      this.initSession();
      this.autoTrackCategory();
      this.startAbandonmentTimer();

      // Update subscriber last seen
      const sub = this.getSubscriber();
      if (sub) {
        sub.lastSeen = new Date().toISOString();
        sub.visits = (sub.visits || 0) + 1;
        localStorage.setItem(this.storageKey, JSON.stringify(sub));
      }
    }
  };

  // Make globally accessible
  window.AP_EMAIL = AP_EMAIL;

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AP_EMAIL.init());
  } else {
    AP_EMAIL.init();
  }
})();
