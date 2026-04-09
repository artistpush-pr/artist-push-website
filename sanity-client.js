/**
 * Sanity CMS Client for Artist Push
 * Fetches dynamic content from Sanity.io
 */
const SANITY_PROJECT_ID = 'p6u6p6xi';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';

function sanityQuery(query) {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}`;
  return fetch(url)
    .then(function(response) {
      if (!response.ok) throw new Error('Sanity API error: ' + response.status);
      return response.json();
    })
    .then(function(data) {
      return data.result;
    });
}

/* ── Icon mapping: playlist title → local SVG file ── */
var PLAYLIST_TITLE_ICON_MAP = {
  'hip hop springboard': 'headphones',
  'curated "top speed"': 'lightning',
  'curated top speed': 'lightning',
  'indie gold collection': 'vinyl-record',
  'chill vibes daily': 'ghost',
  'latin heat mix': 'star',
  'r&b essentials': 'radio',
};

/* Fallback order if title doesn't match */
var PLAYLIST_ICON_ORDER = ['headphones', 'lightning', 'vinyl-record', 'ghost', 'star', 'radio'];

function getPlaylistIconHtml(title, index) {
  var key = (title || '').toLowerCase().trim();
  var name = PLAYLIST_TITLE_ICON_MAP[key] || PLAYLIST_ICON_ORDER[index % PLAYLIST_ICON_ORDER.length] || 'headphones';
  return '<img class="svg-icon" src="assets/icons/' + name + '.svg?v=3" alt="">';
}

/* ── Global: Add playlist to cart (called from Sanity-rendered buttons) ── */
function addPlaylistToCart(title, price) {
  if (typeof Cart === 'undefined' || !Cart.addItem) {
    console.warn('Cart not available');
    return;
  }
  Cart.addItem({
    id: 'playlist-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: 'Playlist: ' + title,
    serviceType: 'Playlist Placement',
    qtyLabel: 'Featured Playlist',
    quantity: 1,
    price: price,
    platform: 'Spotify',
  });
}

/* ── Featured Playlists ── */
function loadFeaturedPlaylists() {
  const grid = document.querySelector('.playlist-grid');
  if (!grid) return;

  sanityQuery('*[_type == "playlist"] | order(order asc) {title, icon, likes, genre, price}')
    .then(function(playlists) {
      if (!playlists || playlists.length === 0) return; // keep static fallback

      grid.innerHTML = playlists.map(function(p, i) {
        var safeTitle = escapeHtml(p.title).replace(/'/g, "\\'");
        return '<div class="playlist-card">' +
          '<div class="playlist-card-icon">' + getPlaylistIconHtml(p.title, i) + '</div>' +
          '<h4>' + escapeHtml(p.title) + '</h4>' +
          '<div class="meta">' + escapeHtml(p.likes) + ' &middot; ' + escapeHtml(p.genre) + '</div>' +
          '<div class="playlist-price">$' + (parseFloat(p.price) || 0).toFixed(2) + '</div>' +
          '<button class="btn btn-sm btn-primary" onclick="addPlaylistToCart(\'' + safeTitle + '\', ' + (parseFloat(p.price) || 0) + ')">Add to Cart</button>' +
        '</div>';
      }).join('');
    })
    .catch(function(err) {
      console.warn('Sanity: Could not load playlists, using static fallback.', err);
    });
}

/* ── Testimonials ── */
function loadTestimonials() {
  var container = document.querySelector('.testimonials-grid');
  if (!container) return;

  sanityQuery('*[_type == "testimonial"] | order(order asc) {name, role, text, rating, "avatarUrl": avatar.asset->url}')
    .then(function(testimonials) {
      if (!testimonials || testimonials.length === 0) return;

      container.innerHTML = testimonials.map(function(t) {
        var stars = '';
        for (var i = 0; i < 5; i++) {
          stars += i < t.rating ? '&#9733;' : '&#9734;';
        }
        var avatarHtml = t.avatarUrl
          ? '<img class="testimonial-avatar" src="' + t.avatarUrl + '?w=96&h=96&fit=crop" alt="' + escapeHtml(t.name) + '">'
          : '<div class="testimonial-avatar">' + t.name.split(' ').map(function(n){return n[0]}).join('') + '</div>';

        return '<div class="testimonial-card fade-up">' +
          '<div class="testimonial-stars">' + stars + '</div>' +
          '<div class="testimonial-text">"' + escapeHtml(t.text) + '"</div>' +
          '<div class="testimonial-author">' +
            avatarHtml +
            '<div><div class="testimonial-name">' + escapeHtml(t.name) + '</div>' +
            '<div class="testimonial-role">' + escapeHtml(t.role) + '</div></div>' +
          '</div>' +
        '</div>';
      }).join('');
    })
    .catch(function(err) {
      console.warn('Sanity: Could not load testimonials, using static fallback.', err);
    });
}

/* ── FAQ ── */
function loadFAQ() {
  var container = document.querySelector('.faq-list');
  if (!container) return;

  sanityQuery('*[_type == "faq"] | order(order asc) {question, answer}')
    .then(function(faqs) {
      if (!faqs || faqs.length === 0) return;

      container.innerHTML = faqs.map(function(f) {
        return '<div class="faq-item">' +
          '<button class="faq-question" onclick="this.parentElement.classList.toggle(\'active\')">' +
            escapeHtml(f.question) +
            '<span class="faq-toggle">+</span>' +
          '</button>' +
          '<div class="faq-answer"><div class="faq-answer-inner">' + escapeHtml(f.answer) + '</div></div>' +
        '</div>';
      }).join('');
    })
    .catch(function(err) {
      console.warn('Sanity: Could not load FAQ, using static fallback.', err);
    });
}

/* ── Utility ── */
function escapeHtml(text) {
  if (!text) return '';
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ── Initialize ── */
document.addEventListener('DOMContentLoaded', function() {
  loadFeaturedPlaylists();
  loadTestimonials();
  loadFAQ();
});
