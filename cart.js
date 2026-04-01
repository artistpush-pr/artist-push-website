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
      <a href="cart.html" class="cart-notif-link">View Cart &rarr;</a>
    `;
    document.body.appendChild(notif);

    // Animate in
    requestAnimationFrame(() => notif.classList.add('visible'));

    // Auto remove
    setTimeout(() => {
      notif.classList.remove('visible');
      setTimeout(() => notif.remove(), 300);
    }, 3000);

    // Show upsell popup after small delay
    this._showUpsellPopup(name);
  },

  // ─── Upsell popup: 5% off second item ───
  _showUpsellPopup(itemName) {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem('upsell_dismissed')) return;

    // Remove any existing popup
    const existingPopup = document.querySelector('.upsell-overlay');
    if (existingPopup) existingPopup.remove();

    // Determine "Browse Services" link based on current page
    let browseHref = 'index.html#popular-services';
    const path = window.location.pathname;
    if (path.includes('spotify')) browseHref = 'spotify.html#packages';
    else if (path.includes('soundcloud')) browseHref = 'soundcloud.html#packages';
    else if (path.includes('index') || path.endsWith('/')) browseHref = '#popular-services';

    const overlay = document.createElement('div');
    overlay.className = 'upsell-overlay';
    overlay.innerHTML = `
      <div class="upsell-popup">
        <button class="upsell-close" aria-label="Close">&times;</button>
        <div class="upsell-badge">LIMITED OFFER</div>
        <div class="upsell-discount">5% OFF</div>
        <h3>Add a Second Item &amp; Save</h3>
        <p>You just added <strong>${itemName}</strong>. Add any second service to your cart and get <strong>5% off</strong> your entire order.</p>
        <div class="upsell-code">
          <span>Promo code:</span>
          <strong>DOUBLE5</strong>
          <button class="upsell-copy" onclick="navigator.clipboard.writeText('DOUBLE5'); this.textContent='Copied!';">Copy</button>
        </div>
        <div class="upsell-actions">
          <a href="${browseHref}" class="btn btn-primary upsell-btn upsell-browse">Browse Services</a>
          <button class="btn btn-outline upsell-btn upsell-dismiss">No Thanks</button>
        </div>
        <div class="upsell-timer">Offer expires in <span class="upsell-countdown">10:00</span></div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close handlers
    const closePopup = () => {
      sessionStorage.setItem('upsell_dismissed', '1');
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('.upsell-close').addEventListener('click', closePopup);
    overlay.querySelector('.upsell-dismiss').addEventListener('click', closePopup);
    overlay.querySelector('.upsell-browse').addEventListener('click', () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup();
    });

    // Animate in after delay
    setTimeout(() => overlay.classList.add('visible'), 800);

    // Countdown timer
    let seconds = 600; // 10 minutes
    const countdownEl = overlay.querySelector('.upsell-countdown');
    const timer = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(timer);
        closePopup();
        return;
      }
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      countdownEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }, 1000);
  },

  // ─── Init: update badges on page load ───
  init() {
    this._updateBadge();
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => Cart.init());
