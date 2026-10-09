
(function(){
  let q=[],i=0,t=null,cur=null,started=0;

  function safe(v){
    return typeof esc==='function' ? esc(v) : String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function offers(p){
    return (Array.isArray(p?.relatedOffers)?p.relatedOffers:[])
      .filter(o=>o && o.active!==false && Number(o.offerPrice)>0 && o.productId)
      .sort((a,b)=>(Number(a.sequence||a.order)||9999)-(Number(b.sequence||b.order)||9999));
  }

  function fmt(ms){
    const s=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(s/60),r=s%60;
    return String(m).padStart(2,'0')+':'+String(r).padStart(2,'0');
  }

  function closeOffer(){
    clearInterval(t);t=null;cur=null;
    const e=$('gmPostCartOffer');
    if(e){e.classList.remove('open');e.setAttribute('aria-hidden','true');e.style.display='none'}
    window.closePostCartOffer=closeOffer;window.gmClosePostCartOffer=closeOffer;
  }
  window.gmClosePostCartOffer=closeOffer;window.closePostCartOffer=closeOffer;

  function next(){
    clearInterval(t);
    i++;
    if(i<q.length)setTimeout(()=>render(q[i]),180);
    else closeOffer();
  }

  function render(o){
    const p=products.find(x=>String(x.id)===String(o.productId));
    if(!p)return next();

    cur={source:window.gmOfferSourceProduct,target:p,config:o};
    started=Date.now();

    // Default = 3 minutes. If durationMinutes already exists in saved data, use it.
    const minutes=Math.max(1,Number(o.durationMinutes)||3);
    const end=started+minutes*60000;
    const old=Number(o.oldPrice)||Number(p.oldPrice)||Number(p.price)||0;
    const price=Number(o.offerPrice)||0;

    setMediaBox('gmOfferMedia',p.image||fallback(),p.imageType||p.mediaType||'image');
    $('gmOfferName').textContent=p.name||'منتج مميز';
    $('gmOfferText').textContent=o.text||'اختيار مناسب مع طلبك بسعر خاص لفترة محدودة.';
    $('gmOfferOld').textContent=old>price?old+' ج':'';
    $('gmOfferNew').textContent=price+' ج';
    $('gmOfferSave').textContent=old>price?'توفير '+(old-price)+' ج':'';
    $('gmOfferClock').textContent=fmt(end-Date.now());

    const offerEl=$('gmPostCartOffer');
    const cartBox=document.querySelector('#cartModal .box');
    if(cartBox && offerEl && offerEl.parentElement!==cartBox){cartBox.appendChild(offerEl);}
    if(offerEl){offerEl.classList.add('open');offerEl.setAttribute('aria-hidden','false');offerEl.style.cssText='position:relative;inset:auto;background:transparent;backdrop-filter:none;-webkit-backdrop-filter:none;z-index:1;display:flex;padding:0;margin-top:14px;width:100%;align-items:stretch;justify-content:center;';}

    clearInterval(t);
    t=setInterval(()=>{
      const left=end-Date.now();
      const c=$('gmOfferClock');
      if(c)c.textContent=fmt(left);
      if(left<=0)next();
    },250);
  }

  window.gmShowPostCartOffer=function(sourceProduct){
    q=offers(sourceProduct);
    if(!q.length)return;
    window.gmOfferSourceProduct=sourceProduct;
    i=0;
    render(q[0]);
  };

  const skipBtn=$('gmOfferSkip');if(skipBtn)skipBtn.onclick=function(e){e.preventDefault();e.stopPropagation();next();};

  const acceptBtn=$('gmOfferAccept');if(acceptBtn)acceptBtn.onclick=function(e){e.preventDefault();e.stopPropagation();
    if(!cur)return;

    const o=cur.config,p=cur.target,now=Date.now();
    const minutes=Math.max(1,Number(o.durationMinutes)||3);
    const end=started+minutes*60000;

    if(now>end){next();return}

    const offerId=String(o.offerId||o.id||('RO-'+Date.now().toString(36)));
    const existing=cart.find(x=>String(x.id)===String(p.id)&&String(x.gmOfferId||'')===offerId);

    if(existing){
      existing.quantity++;
    }else{
      cart.push({
        id:p.id,
        name:p.name,
        price:Number(o.offerPrice)||0,
        oldPrice:Number(o.oldPrice)||Number(p.oldPrice)||Number(p.price)||0,
        shippingPrice:Number(p.shippingPrice)||0,
        image:p.image||fallback(),
        gift:p.gift||'',
        quantity:1,
        gmOfferId:offerId,
        gmOfferStartedAt:started,
        gmOfferExpiresAt:end
      });
    }

    updateCart();
    closeOffer();
    openM('cartModal');
  };

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && $('gmPostCartOffer')?.classList.contains('open'))closeOffer();
  });

  window.addEventListener('load',function(){
    try{
      const items=products.flatMap(p=>offers(p).map(o=>{
        const target=products.find(x=>String(x.id)===String(o.productId));
        const old=Number(o.oldPrice)||Number(target?.oldPrice)||Number(target?.price)||0;
        const text=o.tickerText || ('عرض خاص: اطلب '+p.name+' وخد '+(target?.name||'منتج مميز')+' بسعر '+(Number(o.offerPrice)||0)+' ج بدلًا من '+old+' ج');
        return '<span class="gm-ticker-item">🎁 <strong>'+safe(text)+'</strong><span class="gm-ticker-dot">•</span></span>';
      })).join('');

      $('gmOfferTicker').innerHTML=items ? '<div class="gm-ticker-track">'+items+items+'</div>' : '';
    }catch(e){}
  });
})();
