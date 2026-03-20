/* ============================================
   Artist Push — Cart System (localStorage)
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

  // ─── Show "Added to cart" notification ───
  _showNotification(name) {
    // Remove existing
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
  },

  // ─── Init: update badges on page load ───
  init() {
    this._updateBadge();
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => Cart.init());
