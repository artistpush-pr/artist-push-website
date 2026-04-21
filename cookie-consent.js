/**
 * GDPR Cookie Consent Banner
 * ARTISTPUSH OÜ — breakoutmusic.io
 */
(function() {
  if (localStorage.getItem('cookie_consent')) return;

  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = '<div class="cookie-inner"><div class="cookie-text"><p>We use cookies to improve your experience, analyze site traffic, and for marketing purposes. By clicking "Accept All", you consent to our use of cookies. See our <a href="#" class="cookie-link" data-modal="modal-cookies">Cookie Policy</a> for details.</p></div><div class="cookie-actions"><button id="cookie-reject" class="cookie-btn cookie-btn-reject">Reject All</button><button id="cookie-accept" class="cookie-btn cookie-btn-accept">Accept All</button></div></div>';

  var style = document.createElement('style');
  style.textContent = '#cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#141414;border-top:1px solid #2a2a2a;padding:20px 24px;animation:slideUp .4s ease}@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}.cookie-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:24px}.cookie-text p{color:#bbb;font-size:.85rem;line-height:1.6;margin:0}.cookie-link{color:#00FF85;text-decoration:none}.cookie-link:hover{text-decoration:underline}.cookie-actions{display:flex;gap:10px;flex-shrink:0}.cookie-btn{padding:10px 22px;border-radius:8px;font-size:.85rem;font-weight:600;cursor:pointer;border:none;transition:all .2s;white-space:nowrap}.cookie-btn-reject{background:transparent;border:1px solid #2a2a2a;color:#999}.cookie-btn-reject:hover{border-color:#999;color:#fff}.cookie-btn-accept{background:#00FF85;color:#000}.cookie-btn-accept:hover{background:#00cc6a}@media(max-width:640px){.cookie-inner{flex-direction:column;text-align:center}.cookie-actions{width:100%}.cookie-btn{flex:1;padding:12px 16px}}';
  document.head.appendChild(style);
  document.body.appendChild(banner);

  document.getElementById('cookie-accept').addEventListener('click', function() {
    localStorage.setItem('cookie_consent', 'accepted');
    banner.style.animation = 'none';
    banner.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    banner.style.transform = 'translateY(100%)';
    banner.style.opacity = '0';
    setTimeout(function() { banner.remove(); }, 300);
  });

  document.getElementById('cookie-reject').addEventListener('click', function() {
    localStorage.setItem('cookie_consent', 'rejected');
    banner.style.animation = 'none';
    banner.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    banner.style.transform = 'translateY(100%)';
    banner.style.opacity = '0';
    setTimeout(function() { banner.remove(); }, 300);
  });

  var policyLink = banner.querySelector('[data-modal="modal-cookies"]');
  if (policyLink) {
    policyLink.addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof openModal === 'function') openModal('modal-cookies');
    });
  }
})();
