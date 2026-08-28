/* ============================================
   BREAKOUT — Site Search
   Client-side search across services & articles
   ============================================ */

(function () {
  'use strict';

  /* ---------- Search Data Index ---------- */
  var searchData = [
    // ——— SPOTIFY PACKAGES ———
    { title: 'Basic', desc: '3K Plays + 100 Saves + 300 Followers — perfect kickstart for new releases.', price: '$12', platform: 'spotify', type: 'package', url: '/spotify#packages', tags: 'bundle starter beginner plays saves followers' },
    { title: 'Standard', desc: '30K Plays + 1K Saves + 1K Followers — accelerate your growth.', price: '$90', platform: 'spotify', type: 'package', url: '/spotify#packages', tags: 'bundle pro plays saves followers' },
    { title: 'Mainstage', desc: '50K Plays + 3K Saves + 3K Followers — serious promotion power.', price: '$150', platform: 'spotify', type: 'package', url: '/spotify#packages', tags: 'bundle digger plays saves followers' },
    { title: 'Headliner', desc: '100K Plays + 5K Saves + 5K Followers — full-scale campaign.', price: '$299', platform: 'spotify', type: 'package', url: '/spotify#packages', tags: 'bundle star plays saves followers' },

    // ——— SPOTIFY INDIVIDUAL SERVICES ———
    { title: 'Spotify Plays', desc: 'Worldwide, targeted, premium royalty, algorithmic, editorial & podcast plays.', price: 'from $6', platform: 'spotify', type: 'service', url: '/spotify#plays', tags: 'streams plays worldwide targeted premium royalty ranking playlist album algorithmic radio editorial podcast' },
    { title: 'Spotify Followers', desc: 'Grow your artist profile with worldwide & podcast followers.', price: 'from $3', platform: 'spotify', type: 'service', url: '/spotify#followers', tags: 'followers fans audience profile podcast' },
    { title: 'Monthly Listeners', desc: 'Boost your monthly listener count for label attention and playlist placements.', price: 'from $10', platform: 'spotify', type: 'service', url: '/spotify#listeners', tags: 'monthly listeners audience reach algorithmic' },
    { title: 'Spotify Saves', desc: 'Trigger the algorithm with higher save-to-listen ratios.', price: 'from $1', platform: 'spotify', type: 'service', url: '/spotify#saves', tags: 'saves library algorithm signal engagement' },
    { title: 'Spotify Playlist Push', desc: 'Get placed in curated playlists across multiple genres for max exposure.', price: 'from $10', platform: 'spotify', type: 'service', url: '/spotify#playlists', tags: 'playlist push placement curated genre exposure' },
    { title: 'Featured Playlist Placements', desc: 'Hand-picked, high-engagement playlists: Hip Hop, Electronic, Indie, Chill, Latin, R&B.', price: 'from $55', platform: 'spotify', type: 'service', url: '/spotify#featured-playlists', tags: 'featured playlist placement hip hop electronic indie chill latin rnb soul lofi' },
    { title: 'Playlist Pitching', desc: 'We pitch your music directly to genre-matched curators with real feedback and placements.', price: 'from $89', platform: 'spotify', type: 'service', url: '/spotify#pitching', tags: 'pitching curators organic feedback placements blogs' },

    // ——— SOUNDCLOUD PACKAGES ———
    { title: 'SC Basic', desc: '1K Plays + 25 Likes + 100 Followers — great launchpad for new tracks.', price: '$8', platform: 'soundcloud', type: 'package', url: '/soundcloud#packages', tags: 'bundle starter beginner plays likes followers' },
    { title: 'SC Artist', desc: '10K Plays + 50 Likes + 150 Followers — grow your SoundCloud presence.', price: '$12', platform: 'soundcloud', type: 'package', url: '/soundcloud#packages', tags: 'bundle artist plays likes followers' },
    { title: 'SC Pro', desc: '50K Plays + 100 Likes + 500 Followers — for the serious SoundCloud artist.', price: '$38', platform: 'soundcloud', type: 'package', url: '/soundcloud#packages', tags: 'bundle pro plays likes followers' },
    { title: 'SC Digger', desc: '100K Plays + 500 Likes + 1K Followers — major boost.', price: '$70', platform: 'soundcloud', type: 'package', url: '/soundcloud#packages', tags: 'bundle digger plays likes followers' },
    { title: 'SC Star', desc: '1M Plays + 5K Likes + 5K Followers — ultimate SoundCloud campaign.', price: '$650', platform: 'soundcloud', type: 'package', url: '/soundcloud#packages', tags: 'bundle star plays likes followers million' },

    // ——— SOUNDCLOUD INDIVIDUAL SERVICES ———
    { title: 'SoundCloud Plays', desc: 'Worldwide and USA plays for your SoundCloud tracks, delivered organically.', price: 'from $5', platform: 'soundcloud', type: 'service', url: '/soundcloud#plays', tags: 'plays streams worldwide usa targeted organic' },
    { title: 'SoundCloud Followers', desc: 'Build your audience with worldwide or real followers.', price: 'from $3', platform: 'soundcloud', type: 'service', url: '/soundcloud#followers', tags: 'followers fans audience real worldwide' },
    { title: 'SoundCloud Likes', desc: 'Increase social proof and visibility with real likes.', price: 'from $3', platform: 'soundcloud', type: 'service', url: '/soundcloud#likes', tags: 'likes hearts social proof engagement' },
    { title: 'SoundCloud Reposts', desc: 'Spread your tracks to new audiences through repost networks.', price: 'from $3', platform: 'soundcloud', type: 'service', url: '/soundcloud#reposts', tags: 'reposts shares spread virality network' },
    { title: 'SoundCloud Comments', desc: 'Get genuine, music-relevant comments on your tracks.', price: 'from $2', platform: 'soundcloud', type: 'service', url: '/soundcloud#comments', tags: 'comments feedback engagement social proof' },
    { title: 'SoundCloud Organic Push', desc: 'Sustained, community-driven promotion for natural long-term growth.', price: 'from $25', platform: 'soundcloud', type: 'service', url: '/soundcloud#organic', tags: 'organic push promotion natural community sustained growth' },

    // ——— BLOG ARTICLES ———
        { title: 'Spotify Promotion: 2026 Services Breakdown – What Are You Paying For?', desc: 'Type "spotify promotion" into Google and you will find hundreds of companies selling the same service: Real streams, organic growth, no bots, guaranteed results…for prices between …', price: null, platform: 'spotify', type: 'article', url: '/article-spotify-promotion-services-2026', tags: 'spotify promotion services' },
    { title: 'How to Get on Spotify Playlists: Editorial, Algorithmic and Independent Routes', desc: '"How do I get on Spotify playlists" is one question with three answers, and mixing them up is the reason most artists waste their first year.', price: null, platform: 'spotify', type: 'article', url: '/article-how-to-get-on-spotify-playlists', tags: 'how to get on spotify playlists' },
    { title: 'How to Get on Spotify Editorial Playlists', desc: 'Spotify\'s editorial playlists — the ones carrying the platform\'s branding, the genre flagship playlists, the mood playlists, New Music Friday, Fresh Finds — are chosen by real peop…', price: null, platform: 'spotify', type: 'article', url: '/article-spotify-editorial-playlists', tags: 'spotify editorial playlists' },
    { title: 'How to Increase Spotify Monthly Listeners: 13 Tactics', desc: 'The metric that every artist checks but few understand is Monthly Listeners. It isn\'t fans. It isn\'t plays. It\'s not a total count.', price: null, platform: 'spotify', type: 'article', url: '/article-increase-spotify-monthly-listeners', tags: 'increase spotify monthly listeners' },
    { title: 'How to Promote Your Music on SoundCloud in 2026', desc: 'A lot of advice on SoundCloud is just advice on Spotify with the names swapped, and it doesn\'t work for one structural reason: SoundCloud is a social network that also has a music …', price: null, platform: 'soundcloud', type: 'article', url: '/article-promote-music-on-soundcloud-2026', tags: 'promote music on soundcloud' },
    { title: 'SoundCloud Reposts Explained', desc: 'They\'re putting your song into the Following feed of every user who follows the account that reposted it. That\'s all the mechanic is.', price: null, platform: 'soundcloud', type: 'article', url: '/article-soundcloud-reposts-explained', tags: 'soundcloud reposts explained' },
    { title: 'Spotify Playlist Pitching vs Paid Placement', desc: 'If you Google "Spotify playlist promotion" you\'ll get two entirely separate offerings, worded almost identically. Both talk about playlists. Both talk about real listeners.', price: null, platform: 'spotify', type: 'article', url: '/article-playlist-pitching-vs-paid-placement', tags: 'playlist pitching vs paid placement' },
    { title: 'Saves, Streams or Monthly Listeners: Which Metric Drives Reach', desc: 'Streams are counted whenever anyone listens to your music for 30 seconds or more. From any source, anywhere.', price: null, platform: 'spotify', type: 'article', url: '/article-spotify-saves-vs-streams', tags: 'spotify saves vs streams' },
    { title: 'Spotify Release Week Checklist: 14 Days Before, 3 Days After', desc: 'Most release plans fail on a date, not on a decision.', price: null, platform: 'spotify', type: 'article', url: '/article-spotify-release-week-checklist', tags: 'spotify release week checklist' },
{ title: 'How the Spotify Algorithm Works in 2026', desc: 'A practical, non-hype breakdown of what the algorithm actually ranks, which signals move your reach, and how to make release week count.', price: null, platform: 'spotify', type: 'article', url: '/article-spotify-algorithm-2026', tags: 'algorithm discover weekly release radar playlist editorial organic reach skip rate saves replays' }
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
      if (haystack.indexOf(t) === -1) return 0;
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

  /* ---------- Badges ---------- */
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

  /* ---------- Render a Single Item ---------- */
  function renderItem(it) {
    var accentClass = 'search-result-accent--' + (it.type === 'article' ? 'article' : it.platform);
    var articleClass = it.type === 'article' ? ' search-result-item--article' : '';
    return '<a href="' + it.url + '" class="search-result-item' + articleClass + '">' +
      '<div class="search-result-accent ' + accentClass + '"></div>' +
      '<div class="search-result-content">' +
        '<div class="search-result-top">' +
          '<div class="search-result-title">' + it.title + '</div>' +
          '<div class="search-result-badges">' + platformBadge(it) + typeBadge(it) + '</div>' +
        '</div>' +
        '<div class="search-result-desc">' + it.desc + '</div>' +
        (it.price ? '<div class="search-result-price">' + it.price + '</div>' : '') +
      '</div>' +
    '</a>';
  }

  /* ---------- Group & Render Results ---------- */
  function renderResults(items, container) {
    if (items.length === 0) {
      container.innerHTML = '<div class="search-no-results">' +
        '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:12px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>' +
        '<div>No results found</div>' +
        '<div style="font-size:0.78rem;color:#555;margin-top:4px">Try a different keyword or browse services directly</div>' +
      '</div>';
      return;
    }

    // Group by type: services first, then packages, then articles
    var services = [];
    var packages = [];
    var articles = [];
    for (var i = 0; i < Math.min(items.length, 15); i++) {
      var it = items[i];
      if (it.type === 'service') services.push(it);
      else if (it.type === 'package') packages.push(it);
      else articles.push(it);
    }

    var html = '';

    if (services.length > 0) {
      html += '<div class="search-category">Services</div>';
      for (var s = 0; s < services.length; s++) html += renderItem(services[s]);
    }

    if (packages.length > 0) {
      html += '<div class="search-category">Packages</div>';
      for (var p = 0; p < packages.length; p++) html += renderItem(packages[p]);
    }

    if (articles.length > 0) {
      html += '<div class="search-category">Articles</div>';
      for (var a = 0; a < articles.length; a++) html += renderItem(articles[a]);
    }

    var total = services.length + packages.length + articles.length;
    html += '<div class="search-result-count">' + total + ' result' + (total !== 1 ? 's' : '') + '</div>';

    container.innerHTML = html;
  }

  /* ---------- Init Search UI ---------- */
  function initSearch() {
    var overlay = document.getElementById('searchOverlay');
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var closeBtn = document.getElementById('searchClose');

    if (!overlay || !input || !results) return;

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

    // Escape key & Ctrl+K
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeSearch();
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
      }, 180);
    });

    function openSearch() {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { input.focus(); }, 100);
      input.value = '';
      results.innerHTML = '<div class="search-hint">Search services, packages & articles...</div>';
      var mobileNav = document.querySelector('.mobile-nav');
      if (mobileNav) mobileNav.classList.remove('active');
    }

    function closeSearch() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      input.value = '';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
