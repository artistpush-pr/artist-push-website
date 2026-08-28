/**
 * GDPR Cookie Consent Banner + Google Consent Mode v2 + Clarity
 * ARTISTPUSH OÜ — breakoutmusic.io
 */
(function() {
  var STORAGE_KEY = 'cookie_consent';
  var EXPIRY_KEY = 'cookie_consent_expires';
  var SIX_MONTHS = 1000 * 60 * 60 * 24 * 180;

  var stored = localStorage.getItem(STORAGE_KEY);
  var expires = parseInt(localStorage.getItem(EXPIRY_KEY) || '0', 10);
  if (stored && expires && expires > Date.now()) return;
  if (stored && expires && expires <= Date.now()) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  }

  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = '<div class="cookie-inner"><div class="cookie-text"><p>We use cookies to improve your experience, analyze site traffic, and for marketing purposes. By clicking "Accept All", you consent to our use of cookies. See our <a href="/cookies" class="cookie-link">Cookie Policy</a> for details.</p></div><div class="cookie-actions"><button id="cookie-reject" class="cookie-btn cookie-btn-reject">Reject All</button><button id="cookie-accept" class="cookie-btn cookie-btn-accept">Accept All</button></div></div>';

  var style = document.createElement('style');
  // Compact corner card (SEO/UX audit B1): the old full-width bottom strip
  // covered the lower 36px of the hero CTAs at 1440x900 — and any content
  // near the viewport bottom on every page (incl. the checkout button).
  style.textContent = '#cookie-banner{position:fixed;bottom:20px;right:20px;max-width:420px;z-index:9999;background:#141414;border:1px solid #2a2a2a;border-radius:14px;padding:18px 20px;box-shadow:0 12px 40px rgba(0,0,0,.55);animation:slideUp .4s ease}@keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}.cookie-inner{display:flex;flex-direction:column;gap:14px}.cookie-text p{color:#bbb;font-size:.85rem;line-height:1.6;margin:0}.cookie-link{color:#00FF85;text-decoration:none}.cookie-link:hover{text-decoration:underline}.cookie-actions{display:flex;gap:10px}.cookie-btn{flex:1;padding:10px 16px;border-radius:8px;font-size:.85rem;font-weight:600;cursor:pointer;border:none;transition:all .2s;white-space:nowrap}.cookie-btn-reject{background:transparent;border:1px solid #2a2a2a;color:#999}.cookie-btn-reject:hover{border-color:#999;color:#fff}.cookie-btn-accept{background:#00FF85;color:#000}.cookie-btn-accept:hover{background:#00cc6a}@media(max-width:480px){#cookie-banner{left:12px;right:12px;bottom:12px;max-width:none}}';
  document.head.appendChild(style);
  document.body.appendChild(banner);

  function dismissBanner() {
    banner.style.animation = 'none';
    banner.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    banner.style.transform = 'translateY(100%)';
    banner.style.opacity = '0';
    setTimeout(function() { banner.remove(); }, 300);
  }
  function storeChoice(choice) {
    localStorage.setItem(STORAGE_KEY, choice);
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + SIX_MONTHS));
  }

  document.getElementById('cookie-accept').addEventListener('click', function() {
    storeChoice('accepted');
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
    }
    if (typeof clarity === 'function') {
      clarity('consent');
    }
    dismissBanner();
  });

  document.getElementById('cookie-reject').addEventListener('click', function() {
    storeChoice('rejected');
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied'
      });
    }
    // Clarity не вмикаємо — він буде працювати в cookie-less режимі
    dismissBanner();
  });

})();
