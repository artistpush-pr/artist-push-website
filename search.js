/* ============================================
   ARTIST PUSH — Site Search
   Client-side search across services & articles
   ============================================ */

(function () {
  'use strict';

  /* ---------- Search Data Index ---------- */
  const searchData = [
    // ——— SPOTIFY PACKAGES ———
    { title: 'Starter Mix', desc: '3K Plays + 100 Saves + 300 Followers — perfect kickstart for new releases.', price: '$12', platform: 'spotify', type: 'package', url: 'spotify.html#packages', tags: 'bundle starter beginner plays saves followers' },
    { title: 'Pro Mix', desc: '30K Plays + 1K Saves + 1K Followers — accelerate your growth.', price: '$90', platform: 'spotify', type: 'package', url: 'spotify.html#packages', tags: 'bundle pro plays saves followers' },
    { title: 'Digger Mix', desc: '50K Plays + 3K Saves + 3K Followers — serious promotion power.', price: '$150', platform: 'spotify', type: 'package', url: 'spotify.html#packages', tags: 'bundle digger plays saves followers' },
    { title: 'Star Mix', desc: '100K Plays + 5K Saves + 5K Followers — full-scale campaign.', price: '$299', platform: 'spotify', type: 'package', url: 'spotify.html#packages', tags: 'bundle star plays saves followers' },

    // ——— SPOTIFY INDIVIDUAL SERVICES ———
    { title: 'Spotify Plays', desc: 'Worldwide, targeted, premium royalty, algorithmic, editorial & podcast plays.', price: 'from $6', platform: 'spotify', type: 'service', url: 'spotify.html#plays', tags: 'streams plays worldwide targeted premium royalty ranking playlist album algorithmic radio editorial podcast' },
    { title: 'Spotify Followers', desc: 'Grow your artist profile with worldwide & podcast followers.', price: 'from $3', platform: 'spotify', type: 'service', url: 'spotify.html#followers', tags: 'followers fans audience profile podcast' },
    { title: 'Monthly Listeners', desc: 'Boost your monthly listener count for label attention and playlist placements.', price: 'from $10', platform: 'spotify', type: 'service', url: 'spotify.html#listeners', tags: 'monthly listeners audience reach algorithmic' },
    { title: 'Spotify Saves', desc: 'Trigger the algorithm with higher save-to-listen ratios.', price: 'from $1', platform: 'spotify', type: 'service', url: 'spotify.html#saves', tags: 'saves library algorithm signal engagement' },
    { title: 'Spotify Playlist Push', desc: 'Get placed in curated playlists across multiple genres for max exposure.', price: 'from $10', platform: 'spotify', type: 'service', url: 'spotify.html#playlists', tags: 'playlist push placement curated genre exposure' },
    { title: 'Featured Playlist Placements', desc: 'Hand-picked, high-engagement playlists: Hip Hop, Electronic, Indie, Chill, Latin, R&B.', price: 'from $55', platform: 'spotify', type: 'service', url: 'spotify.html#featured-playlists', tags: 'featured playlist placement hip hop electronic indie chill latin rnb soul lofi' },
    { title: 'Playlist Pitching', desc: 'We pitch your music directly to genre-matched curators with real feedback and placements.', price: 'from $89', platform: 'spotify', type: 'service', url: 'spotify.html#pitching', tags: 'pitching curators organic feedback placements blogs' },

    // ——— SOUNDCLOUD PACKAGES ———
    { title: 'SC Starter', desc: '1K Plays + 25 Likes + 100 Followers — great launchpad for new tracks.', price: '$8', platform: 'soundcloud', type: 'package', url: 'soundcloud.html#packages', tags: 'bundle starter beginner plays likes followers' },
    { title: 'SC Artist', desc: '10K Plays + 50 Likes + 150 Followers — grow your SoundCloud presence.', price: '$12', platform: 'soundcloud', type: 'package', url: 'soundcloud.html#packages', tags: 'bundle artist plays likes followers' },
    { title: 'SC Pro', desc: '50K Plays + 100 Likes + 500 Followers — for the serious SoundCloud artist.', price: '$38', platform: 'soundcloud', type: 'package', url: 'soundcloud.html#packages', tags: 'bundle pro plays likes followers' },
    { title: 'SC Digger', desc: '100K Plays + 500 Likes + 1K Followers — major boost.', price: '$70', platform: 'soundcloud', type: 'package', url: 'soundcloud.html#packages', tags: 'bundle digger plays likes followers' },
    { title: 'SC Star', desc: '1M Plays + 5K Likes + 5K Followers — ultimate SoundCloud campaign.', price: '$650', platform: 'soundcloud', type: 'package', url: 'soundcloud.html#packages', tags: 'bundle star plays likes followers million' },

    // ——— SOUNDCLOUD INDIVIDUAL SERVICES ———
    { title: 'SoundCloud Plays', desc: 'Worldwide and USA plays for your SoundCloud tracks, delivered organically.', price: 'from $5', platform: 'soundcloud', type: 'service', url: 'soundcloud.html#plays', tags: 'plays streams worldwide usa targeted organic' },
    { title: 'SoundCloud Followers', desc: 'Build your audience with worldwide or real followers.', price: 'from $3', platform: 'soundcloud', type: 'service', url: 'soundcloud.html#followers', tags: 'followers fans audience real worldwide' },
    { title: 'SoundCloud Likes', desc: 'Increase social proof and visibility with real likes.', price: 'from $3', platform: 'soundcloud', type: 'service', url: 'soundcloud.html#likes', tags: 'likes hearts social proof engagement' },
    { title: 'SoundCloud Reposts', desc: 'Spread your tracks to new audiences through repost networks.', price: 'from $3', platform: 'soundcloud', type: 'service', url: 'soundcloud.html#reposts', tags: 'reposts shares spread virality network' },
    { title: 'SoundCloud Comments', desc: 'Get genuine, music-relevant comments on your tracks.', price: 'from $2', platform: 'soundcloud', type: 'service', url: 'soundcloud.html#comments', tags: 'comments feedback engagement social proof' },
    { title: 'SoundCloud Organic Push', desc: 'Sustained, community-driven promotion for natural long-term growth.', price: 'from $25', platform: 'soundcloud', type: 'service', url: 'soundcloud.html#organic', tags: 'organic push promotion natural community sustained growth' },

    // ——— BLOG ARTICLES ———
    { title: 'How the Spotify Algorithm Works in 2026', desc: 'A practical, non-hype breakdown of what the algorithm actually ranks, which signals move your reach, and how to make release week count.', price: null, platform: 'spotify', type: 'article', url: 'article-spotify-algorithm-2026.html', tags: 'algorithm discover weekly release radar playlist editorial organic reach skip rate saves replays' }
  ];

  /* ---------- Helpers ---------- */
  function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9а-яёіїєґ\s]/gi, ' ').replace(/\s+/g, ' ').trim();
  }

  function matchScore(item, terms) {
    var score = 0;
    var haystack = normalize(item.title + ' ' + item.desc + ' ' + (item.tags || '') + ' ' + (item.platform || '') + ' ' + (item.type || ''));
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (haystack.indexOf(t) === -1) return 0; // all terms must match
      // bonus for title match
      if (normalize(item.title).indexOf(t) !== -1) score += 3;
      else score += 1;
    }
    return score;
  }

  function search(query) {
    var terms = normalize(query).split(' ').filter(function (t) { return t.length > 0; });
    if (terms.length === 0) return [];
    var results = [];
    for (var i = 0; i < searchData.length; i++) {
      var s = matchScore(searchData[i], terms);
      if (s > 0) results.push({ item: searchData[i], score: s });
    }
    results.sort(function (a, b) { return b.score - a.score; });
    return results.map(function (r) { return r.item; });
  }

  /* ---------- Platform Badge ---------- */
  function platformBadge(item) {
    if (item.type === 'article') return '<span class="search-badge search-badge--article">Article</span>';
    if (item.platform === 'spotify') return '<span class="search-badge search-badge--spotify">Spotify</span>';
    if (item.platform === 'soundcloud') return '<span class="search-badge search-badge--soundcloud">SoundCloud</span>';
    return '';
  }

  function typeBadge(item) {
    if (item.type === 'package') return '<span class="search-type">Package</span>';
    if (item.type === 'service') return '<span class="search-type">Service</span>';
    return '';
  }

  /* ---------- Render Results ---------- */
  function renderResults(items, container) {
    if (items.length === 0) {
      container.innerHTML = '<div class="search-no-results">No results found. Try a different keyword.</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < Math.min(items.length, 12); i++) {
      var it = items[i];
      html += '<a href="' + it.url + '" class="search-result-item">' +
        '<div class="search-result-top">' +
          '<div class="search-result-title">' + it.title + '</div>' +
          '<div class="search-result-badges">' + platformBadge(it) + typeBadge(it) + '</div>' +
        '</div>' +
        '<div class="search-result-desc">' + it.desc + '</div>' +
        (it.price ? '<div class="search-result-price">' + it.price + '</div>' : '') +
      '</a>';
    }
    container.innerHTML = html;
  }

  /* ---------- Init Search UI ---------- */
  function initSearch() {
    var overlay = document.getElementById('searchOverlay');
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var closeBtn = document.getElementById('searchClose');

    if (!overlay || !input) return;

    // Open triggers
    var triggers = document.querySelectorAll('.search-trigger');
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', function (e) {
        e.preventDefault();
        openSearch();
      });
    }

    // Close
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeSearch();
    });

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeSearch();
      // Ctrl/Cmd + K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (overlay.classList.contains('active')) closeSearch();
        else openSearch();
      }
    });

    // Input handler with debounce
    var debounceTimer;
    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        var q = input.value.trim();
        if (q.length < 2) {
          results.innerHTML = '<div class="search-hint">Type at least 2 characters to search...</div>';
          return;
        }
        var found = search(q);
        renderResults(found, results);
      }, 200);
    });

    function openSearch() {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { input.focus(); }, 100);
      input.value = '';
      results.innerHTML = '<div class="search-hint">Search for services, packages, or articles...</div>';
      // Close mobile nav if open
      var mobileNav = document.querySelector('.mobile-nav');
      if (mobileNav) mobileNav.classList.remove('active');
    }

    function closeSearch() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      input.value = '';
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
