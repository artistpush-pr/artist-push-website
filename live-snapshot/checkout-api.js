const API_URL='https://breakout-api.artistpushnet.workers.dev';
let stripe,elements,cardElement,stripeReady=false;let selectedMethod='hipay';function setupMethodToggle(){function applyState(){var match;document.querySelectorAll('[data-pm-stripe]').forEach(function(el){el.style.display=selectedMethod==='stripe'?'block':'none'});document.querySelectorAll('[data-pm-paypal]').forEach(function(el){el.style.display=selectedMethod==='paypal'?'block':'none'});document.querySelectorAll('[data-pm-cardinity]').forEach(function(el){el.style.display=selectedMethod==='cardinity'?'block':'none'});document.querySelectorAll('[data-pm-label]').forEach(function(el){match=el.dataset.pmLabel===selectedMethod;el.style.borderColor=match?'#00FF85':'#1e1e1e';el.style.color=match?'':'#999'});updatePayButton();var bt=document.querySelector('.btn-text');if(bt){var tt=currentTotals();bt.textContent='Place Order — $'+tt.total.toFixed(2)}}var radios=document.querySelectorAll('input[name="payment-method"]');var defaultRadio=document.querySelector('input[name="payment-method"][value="paypal"]');if(defaultRadio){defaultRadio.checked=true}applyState();radios.forEach(function(r){r.addEventListener('change',function(){selectedMethod=r.value;document.querySelectorAll('[data-pm-stripe]').forEach(function(el){el.style.display=selectedMethod==='stripe'?'block':'none'});document.querySelectorAll('[data-pm-paypal]').forEach(function(el){el.style.display=selectedMethod==='paypal'?'block':'none'});document.querySelectorAll('[data-pm-cardinity]').forEach(function(el){el.style.display=selectedMethod==='cardinity'?'block':'none'});document.querySelectorAll('[data-pm-label]').forEach(function(el){var match=el.dataset.pmLabel===selectedMethod;el.style.borderColor=match?'#00FF85':'#1e1e1e';el.style.color=match?'':'#999'});updatePayButton();var btn=document.querySelector('.btn-text');if(btn){var tt2=currentTotals();btn.textContent='Place Order — $'+tt2.total.toFixed(2)}})})}
function esc(s){const d=document.createElement('div');d.textContent=s||'';return d.innerHTML}
function getBillingCountry(){var el=document.getElementById('billing-country');return el?el.value:''}
function getVatId(){var el=document.getElementById('vat-id');return el?(el.value||'').trim():''}
function currentTotals(){var sub=Cart.getTotal();var discount=appliedPromo?Math.round(sub*appliedPromo.discountPercent)/100:0;var afterDiscount=Math.max(0,sub-discount);var vat={vatRate:0,vatAmount:0,reverseCharge:false,countryName:'',isEU:false,vatIdValid:false};if(window.VATCalc){vat=window.VATCalc.calculate(afterDiscount,getBillingCountry(),getVatId())}var total=Math.round((afterDiscount+vat.vatAmount)*100)/100;return{sub:sub,discount:discount,afterDiscount:afterDiscount,vat:vat,total:total}}
function renderCheckoutSummary(){const items=Cart.getItems();if(!items.length){window.location.href='cart.html';return}document.getElementById('checkout-items').innerHTML=items.map(i=>'<div class="checkout-item"><div><div class="checkout-item-name">'+esc(i.name)+'</div><div class="checkout-item-meta">'+esc(i.serviceType)+' '+(i.qtyLabel?'· '+esc(i.qtyLabel):'')+' × '+i.quantity+'</div></div><div class="checkout-item-price">$'+(i.price*i.quantity).toFixed(2)+'</div></div>').join('');var t=currentTotals();document.getElementById('checkout-subtotal').textContent='$'+t.sub.toFixed(2);var totalEl=document.getElementById('checkout-total');var totalParentRow=totalEl&&totalEl.parentElement?totalEl.parentElement:null;var summaryEl=totalParentRow?totalParentRow.parentElement:null;var oldDiscountRow=document.getElementById('checkout-discount-row');if(oldDiscountRow)oldDiscountRow.remove();var oldVatRow=document.getElementById('checkout-vat-row');if(oldVatRow)oldVatRow.remove();if(appliedPromo&&summaryEl&&totalParentRow){var dr=document.createElement('div');dr.id='checkout-discount-row';dr.className='cart-summary-row';dr.style.cssText='color:#00FF85;';dr.innerHTML='<span>Discount ('+appliedPromo.code+' −'+appliedPromo.discountPercent+'%)</span><span>−$'+t.discount.toFixed(2)+'</span>';summaryEl.insertBefore(dr,totalParentRow)}if(summaryEl&&totalParentRow){if(t.vat.isEU&&t.vat.reverseCharge){var rc=document.createElement('div');rc.id='checkout-vat-row';rc.className='cart-summary-row';rc.style.cssText='color:#9aa0a6;font-size:0.85rem;';rc.innerHTML='<span>VAT reverse charge ('+t.vat.countryName+')</span><span>$0.00</span>';summaryEl.insertBefore(rc,totalParentRow)}else if(t.vat.vatAmount>0){var vr=document.createElement('div');vr.id='checkout-vat-row';vr.className='cart-summary-row';vr.innerHTML='<span>VAT ('+t.vat.vatRate+'% · '+t.vat.countryName+')</span><span>$'+t.vat.vatAmount.toFixed(2)+'</span>';summaryEl.insertBefore(vr,totalParentRow)}}document.getElementById('checkout-total').textContent='$'+t.total.toFixed(2);var bt=document.querySelector('.btn-text');if(bt)bt.textContent='Place Order — $'+t.total.toFixed(2)}
async function initStripe(){stripeReady=true;var ce=document.getElementById('card-element');if(ce){ce.style.display='none'}}
function updatePayButton(){var t=document.getElementById('terms-agree').checked;var b=document.getElementById('pay-button');if(b)b.disabled=!t}
async function tokenizeHipayCard(){if(!window.HiPay||!window.HipayInstance){throw new Error('HiPay SDK not loaded')}return new Promise(function(resolve,reject){window.HipayInstance.getPaymentCardToken({}).then(function(token){if(token&&token.token)resolve(token);else reject(new Error('No HiPay token returned'))}).catch(function(err){reject(err)})})}
function browserInfoForHipay(){return{javaEnabled:!!(navigator.javaEnabled&&navigator.javaEnabled()),javascriptEnabled:true,language:(navigator.language||'en-US'),colorDepth:(screen&&screen.colorDepth)||24,screenHeight:(screen&&screen.height)||768,screenWidth:(screen&&screen.width)||1024,timezone:new Date().getTimezoneOffset()}}
async function handlePayment(e){e.preventDefault();var btn=document.getElementById('pay-button');var email=document.getElementById('email').value.trim();var name=(document.getElementById('card-name')||{}).value||'';name=name.trim();var url=document.getElementById('track-url').value.trim();if(!email){alert('Please enter your email address.');return}if(!getBillingCountry()){alert('Please select your billing country.');document.getElementById('billing-country').focus();return}if(!document.getElementById('terms-agree').checked){alert('Please agree to the Terms of Service and Refund Policy.');return}btn.disabled=true;btn.classList.add('loading');try{var items=Cart.getItems();var t=currentTotals();var hipayExtra={};if(selectedMethod==='hipay'){var errEl=document.getElementById('hipay-errors');if(errEl){errEl.style.display='none';errEl.textContent=''}try{var token=await tokenizeHipayCard();hipayExtra.hipayCardToken=token.token;hipayExtra.hipayPaymentProduct=token.brand?String(token.brand).toLowerCase():'visa';hipayExtra.browser=browserInfoForHipay()}catch(tokErr){if(errEl){errEl.style.display='block';errEl.textContent=tokErr.message||'Card tokenization failed'}btn.disabled=false;btn.classList.remove('loading');return}}var firstName=(document.getElementById('first-name')||{}).value||'';firstName=firstName.trim();var lastName=(document.getElementById('last-name')||{}).value||'';lastName=lastName.trim();if(!firstName||!lastName){alert('Please enter your first and last name.');btn.disabled=false;btn.classList.remove('loading');return}var payload={email:email,name:(firstName+' '+lastName).trim()||name||null,firstname:firstName,lastname:lastName,items:items.map(function(i){return{platform:i.platform||'general',serviceType:i.serviceType||i.name,serviceVariant:i.qtyLabel||null,quantity:i.quantity,unitPrice:i.price,targetUrl:url||null}}),currency:'USD',paymentMethod:selectedMethod,promoCode:appliedPromo?appliedPromo.code:null,billingCountry:getBillingCountry(),vatId:getVatId()||null,vatRate:t.vat.vatRate,vatAmount:t.vat.vatAmount,vatReverseCharge:t.vat.reverseCharge,subtotal:t.sub,promoDiscount:t.discount,totalWithVat:t.total};Object.assign(payload,hipayExtra);var r=await fetch(API_URL+'/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok){var err=await r.json();throw new Error(err.error||'Failed to create order')}var res=await r.json();sessionStorage.setItem('ap_order',JSON.stringify({id:res.order.orderNumber,orderNumber:res.order.orderNumber,amount:t.total*100,email:email,trackUrl:url,items:items,paymentMethod:selectedMethod,date:new Date().toISOString()}));if(typeof Auth!=='undefined'&&Auth.isLoggedIn())Auth.saveOrder(items,t.total);Cart.clear();if(selectedMethod==='hipay'&&res.hipay&&res.hipay.forwardUrl){window.location.href=res.hipay.forwardUrl;return}if(selectedMethod==='cardinity'&&res.cardinity&&res.cardinity.action){var cform=document.createElement('form');cform.method='POST';cform.action=res.cardinity.action;Object.keys(res.cardinity.fields).forEach(function(k){var inp=document.createElement('input');inp.type='hidden';inp.name=k;inp.value=res.cardinity.fields[k];cform.appendChild(inp)});document.body.appendChild(cform);cform.submit();return}window.location.href='success.html'}catch(err){console.error('Order error:',err);var ce=document.getElementById('card-errors');if(ce){ce.textContent=err.message||'An error occurred.'}var he=document.getElementById('hipay-errors');if(he&&selectedMethod==='hipay'){he.style.display='block';he.textContent=err.message||'An error occurred.'}btn.disabled=false;btn.classList.remove('loading')}}
renderCheckoutSummary();setupMethodToggle();initStripe();try{var savedPromo=sessionStorage.getItem("active_promo");if(!savedPromo){var lp=JSON.parse(localStorage.getItem("breakout_promo")||"null");if(lp&&lp.code&&(!lp.exp||Date.now()<lp.exp)){savedPromo=lp.code}}if(savedPromo){document.getElementById("promo-input").value=savedPromo;setTimeout(applyPromo,300)}}catch(e){};/*auto_apply_promo*/var appliedPromo=null;function applyPromo(){var code=document.getElementById('promo-input').value.trim();var msg=document.getElementById('promo-message');if(!code){msg.textContent='Enter a code';msg.style.color='#ff4d4d';return}msg.textContent='Checking...';msg.style.color='#999';fetch(API_URL+'/api/promo/validate?code='+encodeURIComponent(code)+'&items='+Cart.getItems().length).then(function(r){return r.json()}).then(function(d){if(d.valid){appliedPromo={code:d.code,discountPercent:d.discountPercent};msg.textContent='✅ '+d.code+' applied: '+d.discountPercent+'% off';msg.style.color='#00FF85';document.getElementById('promo-input').disabled=true;document.getElementById('promo-apply-btn').textContent='Remove';renderCheckoutSummary()}else{appliedPromo=null;msg.textContent='Invalid or expired code';msg.style.color='#ff4d4d';renderCheckoutSummary()}}).catch(function(){msg.textContent='Network error';msg.style.color='#ff4d4d'})}function removePromo(){appliedPromo=null;document.getElementById('promo-input').value='';document.getElementById('promo-input').disabled=false;document.getElementById('promo-apply-btn').textContent='Apply';document.getElementById('promo-message').textContent='';renderCheckoutSummary()}document.getElementById('promo-apply-btn').addEventListener('click',function(){if(appliedPromo)removePromo();else applyPromo()});document.getElementById('terms-agree').addEventListener('change',updatePayButton);document.getElementById('pay-button').addEventListener('click',handlePayment);

function abandonCheckout(){try{var email=document.getElementById('email').value.trim();if(!email||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return;var items=Cart.getItems();if(!items.length)return;var subtotal=Cart.getTotal();var lastSnap=sessionStorage.getItem('abandon_snap');var snap=email+'|'+subtotal+'|'+items.length;if(snap===lastSnap)return;sessionStorage.setItem('abandon_snap',snap);var data={email:email,items:items.map(function(i){return{platform:i.platform||'general',serviceType:i.serviceType||i.name,serviceVariant:i.qtyLabel||null,quantity:i.quantity,unitPrice:i.price,targetUrl:document.getElementById('track-url').value.trim()||null}}),subtotal:subtotal,promoCode:appliedPromo?appliedPromo.code:null};var payload=JSON.stringify(data);if(navigator.sendBeacon){var blob=new Blob([payload],{type:'text/plain'});navigator.sendBeacon(API_URL+'/api/checkout/abandon',blob)}else{fetch(API_URL+'/api/checkout/abandon',{method:'POST',headers:{'Content-Type':'text/plain'},body:payload}).catch(function(){})}}catch(e){console.warn('abandon capture failed',e)}}var _abandonDebounce;function scheduleAbandon(){clearTimeout(_abandonDebounce);_abandonDebounce=setTimeout(abandonCheckout,800)}document.getElementById('email').addEventListener('blur',scheduleAbandon);document.getElementById('email').addEventListener('input',scheduleAbandon);window.addEventListener('beforeunload',abandonCheckout);window.addEventListener('pagehide',abandonCheckout);


// ── VAT / Billing country wiring ──────────────────────────────────────────
(function(){
  function setupBillingCountry(){
    var sel=document.getElementById('billing-country');
    if(!sel||!window.VATCalc) return;
    sel.innerHTML=window.VATCalc.buildCountryOptions();
    sel.addEventListener('change',function(){
      var c=sel.value;
      var vatGroup=document.getElementById('vat-id-group');
      if(vatGroup){
        var inEU=window.VATCalc.isEUCountry(c);
        vatGroup.style.display=inEU?'block':'none';
        if(!inEU){
          var v=document.getElementById('vat-id'); if(v) v.value='';
          var m=document.getElementById('vat-id-message'); if(m) m.textContent='';
        }
      }
      renderCheckoutSummary();
    });
    var vatInput=document.getElementById('vat-id');
    if(vatInput){
      vatInput.addEventListener('input',function(){
        var msg=document.getElementById('vat-id-message');
        var c=sel.value;
        if(!msg) return;
        var raw=vatInput.value.trim();
        if(!raw){ msg.textContent=''; renderCheckoutSummary(); return; }
        var ok=window.VATCalc.isValidVatIdFormat(c,raw);
        if(ok){
          msg.textContent='✅ VAT ID format valid · reverse charge applies (0% VAT)';
          msg.style.color='#00FF85';
        } else {
          msg.textContent='Format does not match '+c+' VAT ID — VAT will still be charged';
          msg.style.color='#ff8a4d';
        }
        renderCheckoutSummary();
      });
    }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',setupBillingCountry);
  } else { setupBillingCountry(); }
})();


// ── HiPay Hosted Fields init ───────────────────────────────────────────────
// Initialized lazily the first time the user picks "Card (HiPay)". Public
// credentials are NOT in this file — they are fetched from the Worker via
// GET /api/hipay/config.
(function(){
  var hipayInited=false;
  async function initHipay(){
    if(hipayInited) return;
    if(!window.HiPay){console.warn('HiPay SDK not loaded'); return;}
    try{
      var cfgRes=await fetch(API_URL+'/api/hipay/config');
      if(!cfgRes.ok){throw new Error('HiPay config not available')}
      var cfg=await cfgRes.json();
      window.HipayInstance=new HiPay({
        username:cfg.publicUsername,
        password:cfg.publicPassword,
        environment:cfg.environment||'production',
        lang:'en'
      });
      var cardInstance=window.HipayInstance.create('card',{
        template:'auto',
        selector:'hipay-card-container'
      });
      window.HipayCardInstance=cardInstance;
      cardInstance.on('change',function(state){
        var errEl=document.getElementById('hipay-errors');
        if(state&&state.error&&errEl){errEl.style.display='block';errEl.textContent=state.error}
        else if(errEl){errEl.style.display='none';errEl.textContent=''}
      });
      // Replace the global tokenizer to use the card instance (more reliable)
      window.tokenizeHipayCard=function(){
        return window.HipayCardInstance.getPaymentData().then(function(data){
          return {token:data.token, brand:data.brand};
        });
      };
      hipayInited=true;
    } catch(err){
      console.error('HiPay init failed:',err);
      var errEl=document.getElementById('hipay-errors');
      if(errEl){errEl.style.display='block';errEl.textContent='Could not load HiPay fields: '+(err.message||err)}
    }
  }
  // Hook into payment method radio change
  document.querySelectorAll('input[name="payment-method"]').forEach(function(r){
    r.addEventListener('change',function(){
      document.querySelectorAll('[data-pm-hipay]').forEach(function(el){el.style.display=(r.value==='hipay'&&r.checked)?'block':'none'});
      document.querySelectorAll('[data-pm-label]').forEach(function(el){var match=el.dataset.pmLabel===r.value;if(match){el.style.borderColor='#00FF85';el.style.color=''}});
      if(r.value==='hipay'&&r.checked){ initHipay(); }
    });
  });
  // If HiPay is the default-checked method, init immediately on page load.
  function autoInitIfHipayDefault(){
    var checked=document.querySelector('input[name="payment-method"]:checked');
    if(checked && checked.value==='hipay'){
      // Wait a tick to ensure HiPay SDK <script> has parsed.
      function tryInit(retries){
        if(typeof HiPay!=='undefined'){ initHipay(); }
        else if(retries>0){ setTimeout(function(){tryInit(retries-1)},250); }
        else { console.warn('HiPay SDK never loaded'); }
      }
      tryInit(20);  // try for up to 5 seconds
    }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',autoInitIfHipayDefault);
  } else { autoInitIfHipayDefault(); }
})();


// ── "I'll provide the link later" checkbox toggles track-url field ─────
(function(){
  function setup(){
    var cb = document.getElementById('no-link-checkbox');
    var url = document.getElementById('track-url');
    if(!cb || !url) return;
    cb.addEventListener('change', function(){
      if(cb.checked){
        url.value = '';
        url.disabled = true;
        url.style.opacity = '0.5';
        url.placeholder = 'You will provide the link via email after payment';
      } else {
        url.disabled = false;
        url.style.opacity = '';
        url.placeholder = 'https://open.spotify.com/track/...';
      }
    });
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', setup);
  } else { setup(); }
})();

// ── Payment method ordering by billing region ──────────────────────────────
// US visitors: HiPay first; everyone else: Cardinity first. Falls back to
// the rest-of-world order if the geo endpoint is unavailable.
(function(){
  var ORDER_US=['hipay','cardinity','paypal'];
  var ORDER_ROW=['cardinity','hipay','paypal'];
  function applyOrder(order){
    var container=document.querySelector('.payment-method-toggle');
    if(!container) return;
    order.forEach(function(v){
      var lbl=container.querySelector('[data-pm-label="'+v+'"]');
      if(lbl) container.appendChild(lbl);
    });
    var first=container.querySelector('[data-pm-label="'+order[0]+'"] input[name="payment-method"]');
    if(first){first.checked=true;first.dispatchEvent(new Event('change',{bubbles:true}));}
  }
  function run(){
    fetch(API_URL+'/api/geo').then(function(r){return r.json()}).then(function(g){
      applyOrder(g&&g.country==='US'?ORDER_US:ORDER_ROW);
    }).catch(function(){applyOrder(ORDER_ROW)});
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run)}else{run()}
})();
