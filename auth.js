/* ============================================
   Breakout — Auth System (localStorage)
   Email + Password registration & login
   ============================================ */

const Auth = {
  USERS_KEY: 'artistpush_users',
  SESSION_KEY: 'artistpush_session',
  ORDERS_KEY: 'artistpush_orders',

  // ─── Get all registered users ───
  _getUsers() {
    try { return JSON.parse(localStorage.getItem(this.USERS_KEY)) || []; }
    catch { return []; }
  },

  _saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  // ─── Register ───
  register(name, email, password) {
    if (!name || !email || !password) return { ok: false, error: 'All fields are required.' };
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

    const users = this._getUsers();
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { ok: false, error: 'An account with this email already exists.' };

    const user = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password, // In production, use proper hashing
      createdAt: new Date().toISOString()
    };

    users.push(user);
    this._saveUsers(users);
    this._setSession(user);
    return { ok: true, user: this._publicUser(user) };
  },

  // ─── Login ───
  login(email, password) {
    if (!email || !password) return { ok: false, error: 'Email and password are required.' };

    const users = this._getUsers();
    const user = users.find(u => u.email === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: 'Invalid email or password.' };

    this._setSession(user);
    return { ok: true, user: this._publicUser(user) };
  },

  // ─── Logout ───
  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    this._updateAuthUI();
  },

  // ─── Get current user ───
  getUser() {
    try {
      const session = JSON.parse(localStorage.getItem(this.SESSION_KEY));
      if (!session) return null;
      return session;
    } catch { return null; }
  },

  isLoggedIn() {
    return this.getUser() !== null;
  },

  // ─── Update profile ───
  updateProfile(data) {
    const session = this.getUser();
    if (!session) return { ok: false, error: 'Not logged in.' };

    const users = this._getUsers();
    const idx = users.findIndex(u => u.id === session.id);
    if (idx === -1) return { ok: false, error: 'User not found.' };

    if (data.name) users[idx].name = data.name.trim();
    if (data.email) {
      const emailTaken = users.find(u => u.email === data.email.toLowerCase() && u.id !== session.id);
      if (emailTaken) return { ok: false, error: 'This email is already taken.' };
      users[idx].email = data.email.trim().toLowerCase();
    }

    this._saveUsers(users);
    this._setSession(users[idx]);
    return { ok: true, user: this._publicUser(users[idx]) };
  },

  // ─── Orders ───
  getOrders() {
    const user = this.getUser();
    if (!user) return [];
    try {
      const allOrders = JSON.parse(localStorage.getItem(this.ORDERS_KEY)) || [];
      return allOrders.filter(o => o.userId === user.id).sort((a, b) => b.date - a.date);
    } catch { return []; }
  },

  saveOrder(cartItems, total) {
    const user = this.getUser();
    if (!user) return false;

    try {
      const allOrders = JSON.parse(localStorage.getItem(this.ORDERS_KEY)) || [];
      const order = {
        id: 'ORD-' + Date.now().toString(36).toUpperCase(),
        userId: user.id,
        items: cartItems.map(i => ({
          name: i.name,
          serviceType: i.serviceType || '',
          qtyLabel: i.qtyLabel || '',
          quantity: i.quantity,
          price: i.price,
          platform: i.platform || ''
        })),
        total: total,
        date: Date.now(),
        status: 'Processing'
      };
      allOrders.push(order);
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(allOrders));
      return order;
    } catch { return false; }
  },

  // ─── Internal helpers ───
  _setSession(user) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(this._publicUser(user)));
    this._updateAuthUI();
  },

  _publicUser(user) {
    return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
  },

  _updateAuthUI() {
    const user = this.getUser();
    const icons = document.querySelectorAll('.auth-trigger');
    icons.forEach(icon => {
      if (user) {
        icon.classList.add('logged-in');
        icon.setAttribute('title', user.name);
      } else {
        icon.classList.remove('logged-in');
        icon.setAttribute('title', 'Account');
      }
    });
  },

  // ─── Init on page load ───
  init() {
    this._updateAuthUI();
  }
};

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
  Auth.init();
}
