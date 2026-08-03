// ── Breakout gift widget ───────────────────────────────────────────────────
// Shown only to visitors arriving from the email campaign link (?box=1).
// The click happened in the email — here the box is already open: the
// dragon is out and the 25% code is immediately visible. The code is
// stored right away so checkout auto-applies it (sessionStorage +
// localStorage fallback).
(function(){
  var PROMO_CODE='BREAKOUT25';
  var PROMO_EXPIRES=new Date('2026-08-20T23:59:59').getTime();
  var params=new URLSearchParams(window.location.search);
  if(params.get('box')===null) return;
  if(Date.now()>PROMO_EXPIRES) return;

  try{
    sessionStorage.setItem('active_promo',PROMO_CODE);
    localStorage.setItem('breakout_promo',JSON.stringify({code:PROMO_CODE,exp:PROMO_EXPIRES}));
  }catch(e){}
  if(typeof gtag==='function'){gtag('event','gift_box_open',{promo_code:PROMO_CODE})}

  var css=''+
  '#bo-box-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.92);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .4s;overflow-y:auto;}'+
  '#bo-box-overlay.bo-show{opacity:1;}'+
  '.bo-box-modal{position:relative;text-align:center;padding:20px;max-width:560px;width:94%;animation:bo-in .55s ease-out;}'+
  '@keyframes bo-in{0%{opacity:0;transform:scale(.85)}100%{opacity:1;transform:scale(1)}}'+
  '.bo-box-img{width:min(340px,74vw);aspect-ratio:1/1;object-fit:cover;display:block;margin:0 auto;border-radius:18px;filter:drop-shadow(0 20px 70px rgba(0,255,133,.35));}'+
  '.bo-percent{font-size:clamp(2.6rem,9vw,4rem);font-weight:900;color:#00FF85;line-height:1;margin-top:16px;text-shadow:0 0 60px rgba(0,255,133,.5);}'+
  '.bo-title{color:#fff;font-size:clamp(1.3rem,4vw,1.8rem);font-weight:800;margin:10px 0 4px;letter-spacing:.5px;}'+
  '.bo-code-wrap{display:flex;align-items:center;justify-content:center;gap:10px;margin:20px auto 6px;flex-wrap:wrap;}'+
  '.bo-code{border:2px dashed #00FF85;border-radius:12px;padding:13px 22px;color:#fff;font-size:1.3rem;font-weight:800;letter-spacing:2px;background:rgba(0,255,133,.06);}'+
  '.bo-copy-btn{background:#141414;color:#fff;border:1px solid #2a2a2a;border-radius:12px;padding:13px 20px;font-size:.95rem;font-weight:700;cursor:pointer;transition:border-color .15s;}'+
  '.bo-copy-btn:hover{border-color:#00FF85;}'+
  '.bo-note{color:#8a8a8a;font-size:.85rem;margin:10px 0 22px;}'+
  '.bo-shop-btn{display:inline-block;background:#00FF85;color:#000;border-radius:12px;padding:15px 44px;font-size:1.05rem;font-weight:800;text-decoration:none;box-shadow:0 0 40px rgba(0,255,133,.35);transition:transform .15s;}'+
  '.bo-shop-btn:hover{transform:scale(1.05);}'+
  '.bo-close{position:absolute;top:4px;right:8px;z-index:2;background:none;border:none;color:#666;font-size:1.6rem;cursor:pointer;line-height:1;padding:8px;}'+
  '.bo-close:hover{color:#fff;}'+
  '@media (max-width:420px){.bo-box-img{width:80vw;}}';

  var style=document.createElement('style');
  style.textContent=css;
  document.head.appendChild(style);

  var overlay=document.createElement('div');
  overlay.id='bo-box-overlay';
  overlay.innerHTML=''+
    '<div class="bo-box-modal">'+
      '<button class="bo-close" aria-label="Close">&#10005;</button>'+
      '<img class="bo-box-img" src="assets/box/box-open-green.jpg" alt="Dragon breaking out of the box">'+
      '<div class="bo-percent">25% OFF</div>'+
      '<div class="bo-title">Your discount broke out</div>'+
      '<div class="bo-code-wrap">'+
        '<div class="bo-code">'+PROMO_CODE+'</div>'+
        '<button class="bo-copy-btn">Copy code</button>'+
      '</div>'+
      '<div class="bo-note">Auto-applied at checkout &middot; Valid through August 20</div>'+
      '<a class="bo-shop-btn" href="#services">SHOP NOW</a>'+
    '</div>';
  document.body.appendChild(overlay);
  requestAnimationFrame(function(){overlay.classList.add('bo-show')});

  overlay.querySelector('.bo-copy-btn').addEventListener('click',function(){
    var btn=this;
    (navigator.clipboard?navigator.clipboard.writeText(PROMO_CODE):Promise.reject()).then(function(){
      btn.textContent='Copied ✓';btn.style.borderColor='#00FF85';
      setTimeout(function(){btn.textContent='Copy code';btn.style.borderColor='#2a2a2a'},2000);
    }).catch(function(){
      window.prompt('Copy the code:',PROMO_CODE);
    });
  });

  function closeOverlay(){
    overlay.classList.remove('bo-show');
    setTimeout(function(){overlay.remove()},400);
    try{history.replaceState(null,'',window.location.pathname)}catch(e){}
  }
  overlay.querySelector('.bo-close').addEventListener('click',closeOverlay);
  overlay.querySelector('.bo-shop-btn').addEventListener('click',closeOverlay);
})();
