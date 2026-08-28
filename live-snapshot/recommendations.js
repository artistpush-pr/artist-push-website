/* ============================================
   Breakout — Recommendations Engine v2
   ============================================ */

(function() {
  'use strict';

  // Prevent double init
  if (window._recInit) return;
  window._recInit = true;

  // ─── Normalize page name ───
  function getPage() {
    let p = window.location.pathname.split('/').pop() || '';
    p = p.replace('.html', '');
    return p || 'index';
  }

  // ─── Service Catalog ───
  const SERVICES = [
    { id: 'sp-starter',   name: 'Spotify Basic',        price: 12, platform: 'spotify',    category: 'package',   icon: 'headphones',   desc: '3K Plays + 100 Saves + 300 Followers',    url: 'spotify#packages',    gradient: 'linear-gradient(135deg, #1DB954 0%, #0a3d1f 100%)' },
    { id: 'sp-pro',       name: 'Spotify Standard',             price: 90, platform: 'spotify',    category: 'package',   icon: 'headphones',   desc: 'Full promo package for serious releases',  url: 'spotify#packages',    gradient: 'linear-gradient(135deg, #1DB954 0%, #064e27 100%)' },
    { id: 'sp-plays',     name: 'Spotify Plays',               price: 6,  platform: 'spotify',    category: 'plays',     icon: 'fast-forward', desc: 'Boost streams & chart rankings',            url: 'spotify#plays',       gradient: 'linear-gradient(135deg, #1DB954 0%, #064e27 100%)' },
    { id: 'sp-followers', name: 'Spotify Followers',            price: 5,  platform: 'spotify',    category: 'followers', icon: 'users',        desc: 'Grow your artist profile audience',         url: 'spotify#followers',   gradient: 'linear-gradient(135deg, #1DB954 0%, #003319 100%)' },
    { id: 'sp-listeners', name: 'Spotify Monthly Listeners',    price: 10, platform: 'spotify',    category: 'listeners', icon: 'radio',        desc: 'Attract labels & playlist curators',        url: 'spotify#listeners',   gradient: 'linear-gradient(135deg, #1DB954 0%, #003319 100%)' },
    { id: 'sp-saves',     name: 'Spotify Saves',               price: 5,  platform: 'spotify',    category: 'saves',     icon: 'bookmark',     desc: 'Increase saves to trigger the algorithm',  url: 'spotify#saves',       gradient: 'linear-gradient(135deg, #1DB954 0%, #0a3d1f 100%)' },
    { id: 'sp-playlists', name: 'Spotify Playlist Placement',   price: 25, platform: 'spotify',    category: 'playlists', icon: 'list',         desc: 'Get placed on curated playlists',           url: 'spotify#playlists',   gradient: 'linear-gradient(135deg, #1DB954 0%, #0a3d1f 100%)' },
    { id: 'sc-starter',   name: 'SC Basic Pack',              price: 8,  platform: 'soundcloud', category: 'package',   icon: 'headphones',   desc: '1K Plays + 100 Likes + 100 Followers',     url: 'soundcloud#packages', gradient: 'linear-gradient(135deg, #FF5500 0%, #4d1900 100%)' },
    { id: 'sc-plays',     name: 'SoundCloud Plays',             price: 3,  platform: 'soundcloud', category: 'plays',     icon: 'fast-forward', desc: 'Worldwide & USA targeted plays',            url: 'soundcloud#plays',    gradient: 'linear-gradient(135deg, #FF5500 0%, #662200 100%)' },
    { id: 'sc-followers', name: 'SoundCloud Followers',          price: 5,  platform: 'soundcloud', category: 'followers', icon: 'users',        desc: 'Build your SoundCloud fanbase',             url: 'soundcloud#followers',gradient: 'linear-gradient(135deg, #FF5500 0%, #662200 100%)' },
    { id: 'sc-likes',     name: 'SoundCloud Likes',             price: 3,  platform: 'soundcloud', category: 'likes',     icon: 'heart',        desc: 'Boost social proof on your tracks',         url: 'soundcloud#likes',    gradient: 'linear-gradient(135deg, #FF5500 0%, #4d1900 100%)' },
    { id: 'sc-reposts',   name: 'SoundCloud Reposts',           price: 4,  platform: 'soundcloud', category: 'reposts',   icon: 'repeat',       desc: 'Extend reach through reposts',              url: 'soundcloud#reposts',  gradient: 'linear-gradient(135deg, #FF5500 0%, #4d1900 100%)' },
  ];

  const TOP_SELLER_IDS = ['sp-starter', 'sp-plays', 'sp-followers', 'sc-starter', 'sp-saves', 'sc-plays'];

  const CROSS_SELL = {
    'plays': ['saves','followers','listeners','playlists'], 'package': ['playlists','listeners'],
    'followers': ['plays','saves','listeners'], 'saves': ['plays','followers','playlists'],
    'listeners': ['plays','playlists','followers'], 'playlists': ['plays','saves','followers'],
    'likes': ['plays','followers','reposts'], 'reposts': ['plays','likes','followers'],
  };

  // ─── Recently Viewed ───
  const RV_KEY = 'breakout_recently_viewed';
  function getRecentlyViewed() { try { return JSON.parse(localStorage.getItem(RV_KEY) || '[]'); } catch { return []; } }
  function trackView(id) {
    const v = getRecentlyViewed().filter(x => x !== id);
    v.unshift(id); if (v.length > 8) v.length = 8;
    localStorage.setItem(RV_KEY, JSON.stringify(v));
  }
  function getServiceById(id) { return SERVICES.find(s => s.id === id); }

  // ─── Icons ───
  const ICONS = {
    headphones: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    'fast-forward': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    radio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  };
  function getIcon(n) { return ICONS[n] || ICONS.headphones; }

  // ─── Render ───
  function renderCard(s, badge) {
    return '<a href="' + s.url + '" class="rec-card" data-sid="' + s.id + '">' +
      '<div class="rec-card-icon" style="background:' + s.gradient + '">' + getIcon(s.icon) + '</div>' +
      '<div class="rec-card-body"><h4>' + s.name + '</h4><p>' + s.desc + '</p>' +
      '<div class="rec-card-footer"><span class="rec-price">from $' + s.price + '</span><span class="rec-cta">View &rarr;</span></div></div>' +
      (badge ? '<span class="rec-badge">' + badge + '</span>' : '') + '</a>';
  }

  function renderSection(o) {
    if (!o.services || o.services.length === 0) return '';
    var cards = o.services.slice(0, o.maxCards || 4).map(function(s, i) {
      return renderCard(s, o.badges ? (o.badges[i] || null) : null);
    }).join('');
    return '<section class="rec-section" id="' + o.id + '"><div class="container">' +
      '<div class="rec-section-header">' + (o.icon ? '<span class="rec-section-icon">' + getIcon(o.icon) + '</span>' : '') +
      '<h2 class="rec-section-title">' + o.title + '</h2></div>' +
      (o.subtitle ? '<p class="rec-section-subtitle">' + o.subtitle + '</p>' : '') +
      '<div class="rec-grid">' + cards + '</div></div></section>';
  }

  // ─── Block Builders ───
  function buildRecentlyViewed(excludeIds) {
    var ids = getRecentlyViewed(), ex = excludeIds || [];
    var svcs = ids.filter(function(id) { return ex.indexOf(id) === -1; }).map(getServiceById).filter(Boolean);
    if (svcs.length < 2) return '';
    return renderSection({ id:'rec-recent', title:'Pick Up Where You Left Off', subtitle:'Services you checked out recently.', icon:'clock', services:svcs, maxCards:4 });
  }

  function buildTopSellers(excludeIds, opts) {
    opts = opts || {};
    var ex = excludeIds || [];
    var svcs = TOP_SELLER_IDS.filter(function(id) { return ex.indexOf(id) === -1; }).map(getServiceById).filter(Boolean);
    return renderSection({ id:'rec-top', title:opts.title||'Fan Favorites', subtitle:opts.subtitle||'The most ordered services by artists this month.', icon:'trending', services:svcs, badges:['#1 Best Seller','Hot','Popular','Rising'], maxCards:opts.maxCards||4 });
  }

  function buildCrossSell(cats, plat) {
    if (!cats || cats.length === 0) return '';
    var suggested = {};
    cats.forEach(function(c) { (CROSS_SELL[c]||[]).forEach(function(x) { suggested[x]=1; }); });
    cats.forEach(function(c) { delete suggested[c]; });
    var svcs = Object.keys(suggested).map(function(c) { return SERVICES.find(function(s) { return s.platform===(plat||'spotify') && s.category===c; }); }).filter(Boolean);
    if (svcs.length === 0) return '';
    return renderSection({ id:'rec-cross', title:'Complete Your Release Strategy', subtitle:'Artists who ordered similar services also added these.', icon:'zap', services:svcs, maxCards:3 });
  }

  function buildPlatformRecs(platform) {
    var other = platform === 'spotify' ? 'soundcloud' : 'spotify';
    var name = other === 'spotify' ? 'Spotify' : 'SoundCloud';
    var svcs = SERVICES.filter(function(s) { return s.platform === other; }).slice(0, 3);
    return renderSection({ id:'rec-platform', title:'Also on ' + name + '?', subtitle:'Maximize your reach \u2014 promote across platforms.', icon:'radio', services:svcs, maxCards:3 });
  }

  function buildExplore() {
    return renderSection({ id:'rec-explore', title:'Let\u2019s Get You Back on Track', subtitle:'Check out our most popular promotion services.', icon:'headphones', services:TOP_SELLER_IDS.map(getServiceById).filter(Boolean), badges:['Best Seller','Hot','Popular','Rising'], maxCards:6 });
  }

  // ─── Inject ───
  function inject(sel, html, pos) {
    if (!html) return;
    var el = document.querySelector(sel);
    if (!el) return;
    el.insertAdjacentHTML(pos || 'beforeend', html);
  }

  // ─── Auto-track ───
  function autoTrack() {
    var page = getPage(), hash = window.location.hash;
    if (page === 'spotify') {
      if (hash.indexOf('plays')!==-1) trackView('sp-plays');
      else if (hash.indexOf('followers')!==-1) trackView('sp-followers');
      else if (hash.indexOf('listeners')!==-1) trackView('sp-listeners');
      else if (hash.indexOf('saves')!==-1) trackView('sp-saves');
      else if (hash.indexOf('playlists')!==-1) trackView('sp-playlists');
      else if (hash.indexOf('packages')!==-1) trackView('sp-starter');
    } else if (page === 'soundcloud') {
      if (hash.indexOf('plays')!==-1) trackView('sc-plays');
      else if (hash.indexOf('followers')!==-1) trackView('sc-followers');
      else if (hash.indexOf('likes')!==-1) trackView('sc-likes');
      else if (hash.indexOf('reposts')!==-1) trackView('sc-reposts');
      else if (hash.indexOf('packages')!==-1) trackView('sc-starter');
    }
  }

  // ─── Init ───
  function init() {
    var page = getPage();
    autoTrack();

  // Inject styles directly to bypass CSS cache
  var st = document.createElement('style');
  st.textContent = [
    '.rec-section { padding: 60px 0 48px; }',
    '.rec-section-header { display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:8px; }',
    '.rec-section-icon { width:28px; height:28px; color:#00FF85; flex-shrink:0; }',
    '.rec-section-icon svg { width:100%; height:100%; }',
    '.rec-section-title { font-size:1.6rem; font-weight:700; color:#fff; margin:0; }',
    '.rec-section-subtitle { color:#888; font-size:0.95rem; margin:6px 0 40px; text-align:center; padding-left:0; }',
    '.rec-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }',
    '.rec-card { position:relative; display:flex; align-items:stretch; background:#0f0f0f; border:1px solid #1e1e1e; border-radius:14px; overflow:hidden; text-decoration:none; color:inherit; min-height:160px; transition:border-color .25s,transform .25s,box-shadow .25s; }',
    '.rec-card:hover { border-color:rgba(0,255,133,0.3); transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,255,133,0.08); }',
    '.rec-card-icon { width:100px; min-width:100px; max-width:100px; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:rgba(255,255,255,0.85); }',
    '.rec-card-icon svg { width:40px; height:40px; }',
    '.rec-card-body { padding:20px 24px; flex:1; min-width:0; display:flex; flex-direction:column; }',
    '.rec-card-body h4 { font-size:1.1rem; font-weight:600; color:#fff; margin:0 0 6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
    '.rec-card-body p { font-size:0.9rem; color:#999; margin:0 0 10px; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; flex:1; }',
    '.rec-card-footer { display:flex; justify-content:space-between; align-items:center; margin-top:auto; }',
    '.rec-price { font-size:1rem; font-weight:600; color:#00FF85; }',
    '.rec-cta { font-size:0.9rem; font-weight:600; color:#888; transition:color .2s; }',
    '.rec-card:hover .rec-cta { color:#00FF85; }',
      '.rec-card .rec-badge { position:absolute !important; top:8px !important; left:8px !important; right:auto !important; bottom:auto !important; width:auto !important; padding:3px 9px !important; border-radius:999px; background:#00FF85; color:#000; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.4px; line-height:1.4; z-index:3; white-space:nowrap; pointer-events:none; box-shadow:0 2px 6px rgba(0,0,0,0.35); border:0; }', '@media (max-width:600px) { .rec-card .rec-badge { font-size:8px !important; padding:2px 7px !important; top:6px !important; left:6px !important; } }',
    '@media(max-width:768px){ .rec-grid{grid-template-columns:1fr 1fr;} }',
    '@media(max-width:520px){ .rec-grid{grid-template-columns:1fr;} }'
  ].join('\n');
  document.head.appendChild(st);


    if (page === 'spotify' || page === 'soundcloud') {
      window.addEventListener('hashchange', autoTrack);
    }

    if (page === 'spotify') {
      inject('footer', buildRecentlyViewed(), 'beforebegin');
      inject('footer', buildPlatformRecs('spotify'), 'beforebegin');
    } else if (page === 'soundcloud') {
      inject('footer', buildRecentlyViewed(), 'beforebegin');
      inject('footer', buildPlatformRecs('soundcloud'), 'beforebegin');
    } else if (page === 'cart') {
      var items = [];
      try { items = JSON.parse(localStorage.getItem('artistpush_cart') || '[]'); } catch(e) {}
      if (items.length > 0) {
        var cats = items.map(function(i) {
          var n = (i.serviceType||i.name||'').toLowerCase();
          if (n.indexOf('play')!==-1) return 'plays';
          if (n.indexOf('follow')!==-1) return 'followers';
          if (n.indexOf('listener')!==-1) return 'listeners';
          if (n.indexOf('save')!==-1) return 'saves';
          if (n.indexOf('playlist')!==-1) return 'playlists';
          if (n.indexOf('like')!==-1) return 'likes';
          if (n.indexOf('repost')!==-1) return 'reposts';
          return 'package';
        });
        var plat = items.some(function(i) { return (i.serviceType||i.name||'').toLowerCase().indexOf('soundcloud')!==-1; }) ? 'soundcloud' : 'spotify';
        inject('footer', buildCrossSell(cats, plat), 'beforebegin');
        inject('footer', buildRecentlyViewed(), 'beforebegin');
      } else {
        inject('footer', buildTopSellers([], {title:'Trending Right Now', subtitle:'Start with our most popular services.'}), 'beforebegin');
      }
    } else if (page === 'success') {
      var order = {};
      try { order = JSON.parse(sessionStorage.getItem('ap_order') || '{}'); } catch(e) {}
      var boughtCats = (order.items||[]).map(function(i) {
        var n = (i.serviceType||i.name||'').toLowerCase();
        if (n.indexOf('play')!==-1) return 'plays';
        if (n.indexOf('follow')!==-1) return 'followers';
        if (n.indexOf('save')!==-1) return 'saves';
        return 'plays';
      });
      inject('footer', buildTopSellers([], {title:'What\u2019s Next for Your Sound?', subtitle:'Keep the momentum \u2014 these are our most popular follow-up services.', maxCards:3}), 'beforebegin');
    } else if (page === 'index' || page === '') {
      var rv = buildRecentlyViewed();
      if (rv) {
        var t = document.getElementById('testimonials');
        if (t) t.insertAdjacentHTML('beforebegin', rv);
      }
    } else if (document.querySelector('.page-404') || document.title.indexOf('404') !== -1) {
      inject('.page-404', buildExplore(), 'beforeend');
    }
  }

  window.Recommendations = { trackView:trackView, getRecentlyViewed:getRecentlyViewed, buildTopSellers:buildTopSellers, buildExplore:buildExplore, init:init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
