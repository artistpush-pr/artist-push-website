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

/* ── Icon mapping: Sanity icon field → local SVG file ── */
var PLAYLIST_ICON_MAP = {
  '🎧': 'headphones',
  '⚡': 'lightning',
  '🎵': 'vinyl-record',
  '👻': 'ghost',
  '🔥': 'star',
  '⭐': 'star',
  '📻': 'radio',
  '🖼': 'headphones',
  '🖼️': 'headphones',
  'headphones': 'headphones',
  'lightning': 'lightning',
  'vinyl-record': 'vinyl-record',
  'ghost': 'ghost',
  'star': 'star',
  'radio': 'radio',
};

function getPlaylistIconHtml(icon) {
  var name = PLAYLIST_ICON_MAP[icon] || PLAYLIST_ICON_MAP[(icon || '').trim()] || 'headphones';
  return '<img class="svg-icon" src="assets/icons/' + name + '.svg?v=2" alt="">';
}

/* ── Featured Playlists ── */
function loadFeaturedPlaylists() {
  const grid = document.querySelector('.playlist-grid');
  if (!grid) return;

  sanityQuery('*[_type == "playlist"] | order(order asc) {title, icon, likes, genre, price}')
    .then(function(playlists) {
      if (!playlists || playlists.length === 0) return; // keep static fallback

      grid.innerHTML = playlists.map(function(p) {
        return '<div class="playlist-card">' +
          '<div class="playlist-card-icon">' + getPlaylistIconHtml(p.icon) + '</div>' +
          '<h4>' + escapeHtml(p.title) + '</h4>' +
          '<div class="meta">' + escapeHtml(p.likes) + ' &middot; ' + escapeHtml(p.genre) + '</div>' +
          '<div class="playlist-price">$' + p.price + '</div>' +
          '<button class="btn btn-sm btn-primary" onclick="addPlaylistToCart(\'' + escapeHtml(p.title) + '\', ' + p.price + ')">Add to Cart</button>' +
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
