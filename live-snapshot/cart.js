/* ============================================
   Breakout — Cart System (localStorage)
   ============================================ */

const Cart = {
  STORAGE_KEY: 'artistpush_cart',

  // ─── Get all items ───
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  // ─── Save items ───
  _save(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this._updateBadge();
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { items } }));
  },

  // ─── Add item ───
  // item: { id, name, serviceType, quantity, qtyLabel, price, platform }
  addItem(item) {
    const items = this.getItems();

    // Check for duplicate (same id + serviceType + qtyLabel)
    const existingIdx = items.findIndex(
      i => i.id === item.id && i.serviceType === item.serviceType && i.qtyLabel === item.qtyLabel
    );

    if (existingIdx >= 0) {
      items[existingIdx].quantity += item.quantity || 1;
    } else {
      items.push({
        ...item,
        quantity: item.quantity || 1,
        addedAt: Date.now(),
      });
    }

    this._save(items);
    // GA4 e-commerce
    if (typeof gtag === 'function') {
      gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: (item.price || 0) * (item.quantity || 1),
        items: [{
          item_id: item.id,
          item_name: item.name,
          item_category: item.platform || 'general',
          item_variant: item.qtyLabel || item.serviceType || '',
          price: item.price,
          quantity: item.quantity || 1
        }]
      });
    }
    this._showNotification(item.name);
    return items;
  },

  // ─── Remove item by index ───
  removeItem(index) {
    const items = this.getItems();
    items.splice(index, 1);
    this._save(items);
    return items;
  },

  // ─── Update quantity ───
  updateQuantity(index, quantity) {
    const items = this.getItems();
    if (items[index]) {
      items[index].quantity = Math.max(1, quantity);
      this._save(items);
    }
    return items;
  },

  // ─── Clear cart ───
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    this._updateBadge();
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { items: [] } }));
  },

  // ─── Get total ───
  getTotal() {
    return this.getItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  // ─── Get item count ───
  getCount() {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },

  // ─── Update cart badge in navbar ───
  _updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.getCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  // ─── Show "Added to cart" notification + upsell popup ───
  _showNotification(name) {
    // Remove existing notifications
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = 'cart-notification';
    notif.innerHTML = `
      <span class="cart-notif-icon">&#10003;</span>
      <span><strong>${name}</strong> added to cart</span>
      <a href="/cart" class="cart-notif-link">View Cart &rarr;</a>
    `;
    document.body.appendChild(notif);

    // Animate in
    requestAnimationFrame(() => notif.classList.add('visible'));

    // Auto remove
    setTimeout(() => {
      notif.classList.remove('visible');
      setTimeout(() => notif.remove(), 300);
    }, 4500);

    // Show the compact upsell card after a short delay
    this._showUpsellPopup(name);
  },

  // ─── Upsell: compact corner card (audit B2 v2 — Yana's call) ───
  // The old full-screen modal steered people back to the catalog with no
  // View Cart button. The offer stays (it sells), but as a small card that
  // does not block the page, with View Cart as the primary action.
  _showUpsellPopup(itemName) {
    if (sessionStorage.getItem('upsell_dismissed')) return;

    // Don't spam visitors who already hold a promo code (e.g. the email
    // campaign's BREAKOUT25 gift) — only one code applies per order anyway
    try {
      if (sessionStorage.getItem('active_promo')) return;
      const lp = JSON.parse(localStorage.getItem('breakout_promo') || 'null');
      if (lp && lp.code && (!lp.exp || Date.now() < lp.exp)) return;
    } catch (e) {}

    const existingCard = document.querySelector('.upsell-card');
    if (existingCard) existingCard.remove();

    let browseHref = '/#popular-services';
    const path = window.location.pathname;
    if (path.includes('spotify')) browseHref = '/spotify#packages';
    else if (path.includes('soundcloud')) browseHref = '/soundcloud#packages';

    const card = document.createElement('div');
    card.className = 'upsell-card';
    card.innerHTML = `
      <button class="upsell-close" aria-label="Close">&times;</button>
      <div class="upsell-card-head"><span class="upsell-card-off">5% OFF</span> Add a second service &amp; save</div>
      <div class="upsell-code">
        <span>Promo code:</span>
        <strong>DOUBLE5</strong>
        <button class="upsell-copy" onclick="navigator.clipboard.writeText('DOUBLE5'); this.textContent='Copied!';">Copy</button>
      </div>
      <div class="upsell-card-actions">
        <a href="/cart" class="btn btn-primary upsell-btn">View Cart &rarr;</a>
        <a href="${browseHref}" class="btn btn-outline upsell-btn upsell-browse">Browse Services</a>
      </div>
      <div class="upsell-timer">Offer expires in <span class="upsell-countdown">10:00</span></div>
    `;
    document.body.appendChild(card);

    // On small screens keep the card above the cookie banner if it is open
    const cb = document.getElementById('cookie-banner');
    if (cb && window.innerWidth <= 480) {
      card.style.bottom = (cb.offsetHeight + 24) + 'px';
    }

    const closeCard = () => {
      sessionStorage.setItem('upsell_dismissed', '1');
      card.classList.remove('visible');
      setTimeout(() => card.remove(), 300);
    };
    card.querySelector('.upsell-close').addEventListener('click', closeCard);
    card.querySelector('.upsell-browse').addEventListener('click', () => {
      card.classList.remove('visible');
      setTimeout(() => card.remove(), 300);
    });

    setTimeout(() => card.classList.add('visible'), 800);

    let seconds = 600;
    const countdownEl = card.querySelector('.upsell-countdown');
    const timer = setInterval(() => {
      seconds--;
      if (seconds <= 0 || !document.body.contains(card)) {
        clearInterval(timer);
        if (document.body.contains(card)) closeCard();
        return;
      }
      const m = Math.floor(seconds / 60);
      const sec = seconds % 60;
      countdownEl.textContent = `${m}:${sec.toString().padStart(2, '0')}`;
    }, 1000);
  },

  // ─── Init: update badges on page load ───
  init() {
    this._updateBadge();
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => Cart.init());
