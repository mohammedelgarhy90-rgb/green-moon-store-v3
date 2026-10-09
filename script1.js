
let products=[],settings={},cart=[],heroIndex=0,detailId=null,heroTimer,promo={code:'',discount:0,freeShipping:false};const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),fallback=()=>products[0]?.image||'/assets/logo.jpg';
function img(words){return products.find(p=>(words||[]).some(w=>String(p.name||'').includes(w)))?.image||fallback()}function openM(id){$(id).classList.add('open');document.body.style.overflow='hidden'}function closeM(id){$(id).classList.remove('open');document.body.style.overflow='';if(id==='productModal'){try{history.replaceState({},'',location.pathname+location.hash)}catch(_){}}}
function closePostCartOffer(){
  if(typeof window.gmClosePostCartOffer==='function'){window.gmClosePostCartOffer();return}
  const e=$('gmPostCartOffer');if(e){e.classList.remove('open');e.setAttribute('aria-hidden','true');e.style.display='none'}
}
window.closePostCartOffer=closePostCartOffer;
(function installUniversalClose(){
  function add(){
    document.querySelectorAll('.modal').forEach(m=>{
      const box=m.querySelector('.box');
      if(!box || box.querySelector('.x,.gm-auto-close'))return;
      const b=document.createElement('button');b.className='gm-auto-close';b.type='button';b.setAttribute('aria-label','إغلاق');b.textContent='×';
      b.onclick=()=>{if(typeof window.closeM==='function')window.closeM(m.id);else m.classList.remove('open')};
      box.prepend(b);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
function gmOpenFinder(){const m=$('gmFinderModal');if(!m)return;m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';if(typeof gmWizardRestart==='function')gmWizardRestart();setTimeout(()=>{const b=$('gmFinderModal').querySelector('.box');if(b)b.scrollTop=0},20)}
function gmCloseFinder(){const m=$('gmFinderModal');if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow='';if(typeof gmThinkingTimer!=='undefined'&&gmThinkingTimer)clearTimeout(gmThinkingTimer);if(typeof gmWizardThinking==='function')gmWizardThinking(false)}
window.gmOpenFinder=gmOpenFinder;window.gmCloseFinder=gmCloseFinder;
function getCats(){let a=settings.gm_categories||settings.categories;if(Array.isArray(a)&&a.length)return a;return[{name:'نباتات الزينة',image:img(['أجلونيما','بوتس','مونسترا'])},{name:'عالم البامبو',image:img(['بامبو'])},{name:'النباتات الداخلية',image:img(['مونسترا','بوتس'])},{name:'أسمدة ومبيدات',image:img(['سماد','مبيد'])},{name:'فازات وقصاري ومستلزمات',image:img(['فاز','قصاري','قصرية'])}]}
function mediaTypeOf(src,type=''){
 const v=String(src||'').toLowerCase();
 if(type==='video'||/^data:video\//.test(v)||/\.(mp4|webm|mov|m4v|ogv)(?:[?#].*)?$/.test(v)) return 'video';
 return 'image';
}
function mediaTag(src,type='',attrs=''){
 const url=src||fallback();
 return mediaTypeOf(url,type)==='video'
  ? `<video class="mediaFill" src="${esc(url)}" muted loop autoplay playsinline ${attrs}></video>`
  : `<img class="mediaFill" loading="lazy" src="${esc(url)}" ${attrs}>`;
}
function setMediaBox(id,src,type='',attrs=''){
 const e=$(id); if(e)e.innerHTML=mediaTag(src,type,attrs);
}

function getHeroes(){let h=settings.gm_hero||settings.hero,a=Array.isArray(h)?h:(h?.slides||[]);return a?.length?a.filter(x=>x&&x.active!==false):[{image:img(['بامبو']),kicker:'الطبيعة.. أقرب إليك',title:'Green Moon',highlight:'Plants and Flowers',text:'نباتات تضيف حياة وجمال لكل مكان',cta:'تسوق الآن',link:'#products'}]}
function renderHero(){let a=getHeroes(),h=a[heroIndex%a.length];setMediaBox('heroMedia',h.image||fallback(),h.imageType||h.mediaType||'image');$('heroText').innerHTML='<div class="kicker">'+esc(h.kicker||'الطبيعة.. أقرب إليك')+'</div><h1>'+esc(h.title||'Green Moon')+'<span>'+esc(h.highlight||'Plants and Flowers')+'</span></h1><p>'+esc(h.text||h.subtitle||'نباتات تضيف حياة وجمال لكل مكان')+'</p><a class="cta" href="'+esc(h.link||'#products')+'">'+esc(h.cta||'تسوق الآن')+' ←</a>';$('dots').innerHTML=a.map((_,i)=>'<i class="'+(i===heroIndex?'on':'')+'"></i>').join('')}
function applyGmSite(){
 const v=settings.gm_site||{},h=v.header||{},hero=v.hero||{},c=v.colors||{},nav=v.nav||{},sec=v.sections||{};
 const logo=h.logo||settings.logo||'/assets/logo.jpg';
 const logoEl=$('logo'); if(logoEl) logoEl.src=logo;
 const splashLogo=document.querySelector('#gmPremiumSplash .gm-logo'); if(splashLogo) splashLogo.src='/logo-splash.jpg';
 const brandName=document.querySelector('.brandText b'); if(brandName) brandName.textContent='GREEN MOON';
 const brandSmall=document.querySelector('.brandText small'); if(brandSmall) brandSmall.textContent='Plants and Flowers';
 const brandOwner=document.querySelector('.brandText em'); if(brandOwner) brandOwner.textContent='Mohamed Elgarhy';
 if(c.primary)document.documentElement.style.setProperty('--g',c.primary);
 if(c.dark)document.documentElement.style.setProperty('--g2',c.dark);
 if(c.gold)document.documentElement.style.setProperty('--gold',c.gold);
 if(c.background)document.documentElement.style.setProperty('--soft',c.background);
 if(c.text)document.documentElement.style.setProperty('--ink',c.text);
 if(hero.image||hero.title||hero.subtitle||hero.cta){
   settings.gm_hero=[{image:hero.image||'',imageType:hero.imageType||'image',kicker:'',title:hero.title||'Green Moon',highlight:'Plants and Flowers',text:hero.subtitle||'',cta:hero.cta||'تسوق الآن',link:hero.link||'#products',active:true}];
 }
 const sectionMap={categories:'categories',hero:'hero',deals:'deals',products:'products',articles:'articles',reviews:'reviews',rewards:'rewards',doctor:'doctor',contact:'contact',footer:'footer'};
 Object.entries(sectionMap).forEach(([key,id])=>{const e=document.getElementById(id);if(e&&sec[key]===false)e.style.display='none';});
}
function renderFooter(){const sc=settings.gm_social||{};const links=[['facebook','Facebook','f'],['instagram','Instagram','◎'],['tiktok','TikTok','♪'],['twitter','X','𝕏'],['whatsapp','WhatsApp','☏'],['phone','اتصال','☎']];const box=$('gmFooterSocial');if(box)box.innerHTML=links.filter(([k])=>sc[k]&&sc[k+'Enabled']!==false).map(([k,label,icon])=>{let href=sc[k];if(k==='whatsapp')href='https://wa.me/'+String(href).replace(/\D/g,'');if(k==='phone'&&!String(href).startsWith('tel:'))href='tel:'+href;return '<a href="'+esc(href)+'" target="'+(k==='phone'?'_self':'_blank')+'" rel="noopener" aria-label="'+label+'">'+icon+'</a>'}).join('');const h=settings.gm_site?.header||{};if($('footerBrand'))$('footerBrand').textContent=h.storeName||settings.storeName||'Green Moon';if($('footerSub'))$('footerSub').textContent=h.tagline||'Plants and Flowers';if($('footerName'))$('footerName').textContent=h.owner||'Mohamed Elgarhy'}
function render(){renderFooter();renderHero();let sv=settings.services||[{icon:'🚚',title:'توصيل سريع',text:'لكل المحافظات'},{icon:'🛡️',title:'منتجات مضمونة',text:'جودة عالية'},{icon:'🌿',title:'اختيارات متنوعة',text:'لكل ذوق'},{icon:'♧',title:'خدمة عملاء مميزة',text:'دائمًا معك'}];$('services').innerHTML=sv.slice(0,4).map(x=>'<div class="service"><span>'+esc(x.icon||'🌿')+'</span><div><b>'+esc(x.title||'خدمة')+'</b><small>'+esc(x.text||'Green Moon')+'</small></div></div>').join('');let ca=getCats();$('cats').innerHTML=ca.map((x,i)=>{let key=x.name||x.title||'';return '<a class="cat" href="#products" role="button" onclick="catFilter(\''+esc(key)+'\');return false"><div class="catImg">'+mediaTag(x.image||fallback(),x.imageType||x.mediaType||'image')+'</div><b>'+esc(x.name||x.title||'قسم')+'</b></a>'}).join('');let home=settings.gm_home||{};let bs=Array.isArray(home.banners)?home.banners:(Array.isArray(settings.banners)?settings.banners:[]);$('banners').innerHTML=bs.filter(x=>x&&x.active!==false).slice(0,2).map(x=>'<div class="banner">'+mediaTag(x.image||fallback(),x.imageType||x.mediaType||'image')+'<div class="bannerText"><a class="cta" href="'+esc(x.link||'#products')+'">'+esc(x.cta||'اكتشف الآن')+' ←</a></div></div>').join('');$('dealsHeading').textContent=(home.headings&&home.headings.deals)||'العروض الحالية';renderDeals();renderProducts(products.slice(0,12));renderArticles();renderFooter()}
function renderProducts(a){
 $('productGrid').innerHTML=a.length?a.map(p=>{
  const o=+p.oldPrice||0,n=+p.price||0,s=p.sticker&&typeof p.sticker==='object'?p.sticker:{},gc=p.giftConfig&&typeof p.giftConfig==='object'?p.giftConfig:{},vc=p.voucherConfig&&typeof p.voucherConfig==='object'?p.voucherConfig:{};
  const sticker=s.active!==false&&s.image?`<span class="gm-product-sticker"><img src="${esc(s.image)}" alt=""></span>`:(s.active!==false&&s.text?`<span class="gm-product-sticker" style="background:${esc(s.color||'#e7bf62')}22;color:${esc(s.color||'#7b5a0a')};border:1px solid ${esc(s.color||'#e7bf62')}55"><span class="gm-product-sticker-text">${esc(s.text)}</span></span>`:'');
  const gifts=(gc.enabled&&Array.isArray(gc.products)?gc.products:[]).map(id=>products.find(q=>String(q.id)===String(id))).filter(Boolean);
  const giftText=gifts.length?`<div class="gm-gift-line"><div class="gm-gift-title">🎁 هدية</div><div class="gm-gift-products">${gifts.map(g=>`<div class="gm-gift-product gm-gift-ribbon" title="${esc(g.name)}"><img src="${esc(g.image||fallback())}" alt="هدية" loading="lazy"><span class="gm-gift-name">${esc(g.name)}</span><span class="gm-gift-bow" aria-hidden="true"></span><button class="gm-claim-gift" type="button" onclick="event.stopPropagation();claimGift(\'${esc(p.id)}\',\'${esc(g.id)}\')">خد هديتك</button></div>`).join('')}</div></div>`:'';
  const voucherText=vc.enabled&&Number(vc.value||0)>0?`<div class="gm-voucher-line">🎟️ قسيمة شرائية بقيمة ${Number(vc.value||0)} ج</div>`:'';
  return `<article class="product" onclick="if(!event.target.closest('button')) detail('${esc(p.id)}')"><div class="pimg" onclick="detail('${esc(p.id)}')">${mediaTag(p.image||fallback(),p.imageType||p.mediaType||'image')}</div><div class="pbody">${sticker}<h3 onclick="detail('${esc(p.id)}')">${esc(p.name)}</h3><div class="price">${o>n?`<span class="old">${o} ج</span>`:''}<span class="new">${n} ج</span></div>${o>n?`<div class="save">💚 توفير ${o-n} ج</div>`:''}${p.gift?`<div class="save">🎁 ${esc(p.gift)}</div>`:''}${giftText}${voucherText}<div class="qty"><button onclick="cardQ('${esc(p.id)}',-1)">−</button><span id="q${esc(p.id)}">1</span><button onclick="cardQ('${esc(p.id)}',1)">+</button></div><button class="add" onclick="add('${esc(p.id)}')">أضف للسلة 🛒</button><button class="detailBtn" onclick="detail('${esc(p.id)}')">التفاصيل</button></div></article>`
 }).join(''):'<p>لا توجد منتجات.</p>';
}

function cardQ(id,n){let e=$('q'+id);if(e)e.textContent=Math.max(1,(+e.textContent||1)+n)}
function claimGift(mainId,giftId){const main=products.find(x=>String(x.id)===String(mainId));const gift=products.find(x=>String(x.id)===String(giftId));if(!main||!gift)return toast('الهدية غير متاحة حاليًا');const cfg=main.giftConfig||{};if(!cfg.enabled||!Array.isArray(cfg.products)||!cfg.products.map(String).includes(String(gift.id)))return toast('الهدية غير متاحة لهذا المنتج');let item=cart.find(x=>String(x.id)===String(main.id)&&!x.isGift&&!x.isVoucher);if(!item){cart.push({id:main.id,productId:main.id,name:main.name,price:Number(main.price)||0,oldPrice:Number(main.oldPrice)||0,shippingPrice:Number(main.shippingPrice)||0,image:main.image||fallback(),imageType:main.imageType||main.mediaType||'image',quantity:1});}syncGifts();updateCart();openM('cartModal');toast('اتضافت هديتك للسلة 🎁');}
function syncGifts(){cart=cart.filter(x=>!x.isGift);const mains=cart.slice();for(const item of mains){const p=products.find(x=>String(x.id)===String(item.id));const ids=Array.isArray(p?.giftConfig?.products)&&p.giftConfig.enabled?p.giftConfig.products:[];for(const gid of ids){const g=products.find(x=>String(x.id)===String(gid));if(!g)continue;cart.push({id:'gift:'+item.id+':'+g.id,productId:g.id,name:g.name,price:0,oldPrice:+g.price||0,shippingPrice:0,image:g.image||fallback(),imageType:g.imageType||g.mediaType||'image',quantity:item.quantity,isGift:true,mainProductId:item.id})}}}
function add(id,forcedQty=null,openCart=true){let p=products.find(x=>String(x.id)===String(id));if(!p)return false;let q=forcedQty==null?Math.max(1,+($('q'+id)?.textContent||1)):Math.max(1,+forcedQty||1);let x=cart.find(x=>String(x.id)===String(id)&&!x.isDeal&&!x.isGift);if(x)x.quantity+=q;else cart.push({id:p.id,productId:p.id,name:p.name,price:+p.price||0,oldPrice:+p.oldPrice||0,shippingPrice:+p.shippingPrice||0,image:p.image||fallback(),imageType:p.imageType||p.mediaType||'image',gift:p.gift||'',quantity:q});syncGifts();let qe=$('q'+id);if(qe)qe.textContent=1;updateCart();if(openCart){openM('cartModal');setTimeout(()=>{if(typeof gmShowPostCartOffer==='function')gmShowPostCartOffer(p)},180)}return true}

function productUrl(id){return location.origin+location.pathname+'?product='+encodeURIComponent(String(id))+'#products'}
function toast(message){
  let el=document.getElementById('gmToast');
  if(!el){
    el=document.createElement('div'); el.id='gmToast';
    el.style.cssText='position:fixed;z-index:999999;left:50%;bottom:92px;transform:translateX(-50%);max-width:calc(100% - 32px);padding:12px 18px;border-radius:14px;background:#063b2b;color:#fff;font:700 14px/1.5 Cairo,Tahoma,Arial,sans-serif;box-shadow:0 12px 35px rgba(0,0,0,.2);text-align:center;opacity:0;pointer-events:none;transition:opacity .18s,transform .18s';
    document.body.appendChild(el);
  }
  el.textContent=String(message||''); el.style.opacity='1'; el.style.transform='translateX(-50%) translateY(-4px)';
  clearTimeout(window.__gmToastTimer); window.__gmToastTimer=setTimeout(()=>{el.style.opacity='0';el.style.transform='translateX(-50%)';},2200);
}

async function shareProduct(id){let p=products.find(x=>String(x.id)===String(id));if(!p)return;let url=productUrl(p.id),text=(p.name||'منتج من Green Moon')+' 🌿';try{if(navigator.share){await navigator.share({title:p.name||'Green Moon',text,url})}else if(navigator.clipboard){await navigator.clipboard.writeText(url);toast&&toast('تم نسخ رابط المنتج')}else{prompt('انسخ رابط المنتج:',url)}}catch(e){if(e?.name!=='AbortError'){try{await navigator.clipboard.writeText(url);toast&&toast('تم نسخ رابط المنتج')}catch(_){}}}}
function renderGiftVisual(p){const box=$('detailGiftVisual');if(!box)return;const gc=p?.giftConfig&&typeof p.giftConfig==='object'?p.giftConfig:{};const gifts=(gc.enabled&&Array.isArray(gc.products)?gc.products:[]).map(id=>products.find(q=>String(q.id)===String(id))).filter(Boolean);box.innerHTML=gifts.length?`<div class="gm-detail-gifts"><div class="gm-detail-gifts-title">🎁 هديتك مع المنتج</div><div class="gm-gift-products">${gifts.map(g=>`<div class="gm-gift-product gm-gift-ribbon" title="${esc(g.name)}"><img src="${esc(g.image||fallback())}" alt="هدية" loading="lazy"><span class="gm-gift-name">${esc(g.name)}</span><span class="gm-gift-bow" aria-hidden="true"></span><button class="gm-claim-gift" type="button" onclick="event.stopPropagation();claimGift(\'${esc(p.id)}\',\'${esc(g.id)}\')">خد هديتك</button></div>`).join('')}</div></div>`:'';}
function detailBack(){closeM('productModal');try{if(location.search.includes('product='))history.replaceState({},'',location.pathname+location.hash)}catch(_){} }
function detail(id){let p=products.find(x=>String(x.id)===String(id));if(!p)return;detailId=p.id;setMediaBox('detailMedia',p.image||fallback(),p.imageType||p.mediaType||'image');$('detailName').textContent=p.name||'';let o=+p.oldPrice||0,n=+p.price||0;$('detailPrice').innerHTML=(o>n?'<span class="old">'+o+' ج</span> ':'')+'<span class="new">'+n+' ج</span>'+(o>n?'<div class="save">💚 هتوفر '+(o-n)+' ج</div>':'');renderGiftVisual(p);let url=productUrl(p.id);$('detailInfo').innerHTML='<b>التفاصيل:</b><br>'+esc(p.details||'لا توجد تفاصيل')+'<br><br><b>التوصيل:</b> '+(+p.shippingPrice||0)+' ج'+(p.gift?'<br><br>🎁 '+esc(p.gift):'')+'<div class="gm-product-url">'+esc(url)+'</div>';$('detailShare').onclick=(e)=>{e.preventDefault();e.stopPropagation();shareProduct(p.id)};openM('productModal');const pm=$('productModal');if(pm){pm.style.zIndex='100003';pm.scrollTop=0}try{history.replaceState({},'',url)}catch(_){} }
function detailAdd(){const id=detailId;closeM('productModal');setTimeout(()=>add(id,null,true),30)}
let voucherPick={mainId:'',budget:0,selected:{}};
function voucherInfoFor(item){const p=products.find(x=>String(x.id)===String(item?.id));const vc=p?.voucherConfig&&typeof p.voucherConfig==='object'?p.voucherConfig:{};if(!vc.enabled)return null;const value=Math.max(0,Number(vc.value)||0),ids=Array.isArray(vc.products)?vc.products.map(String):[];if(!value||!ids.length)return null;return {product:p,value,ids,budget:value*Math.max(1,Number(item.quantity)||1)};}
function voucherSelectedTotal(){return Object.entries(voucherPick.selected).reduce((sum,[id,q])=>{const p=products.find(x=>String(x.id)===String(id));return sum+(p?Number(p.price)||0:0)*Math.max(0,Number(q)||0)},0)}
function renderVoucherPicker(){const item=cart.find(x=>String(x.id)===String(voucherPick.mainId)&&!x.isGift&&!x.isVoucher);const info=voucherInfoFor(item);if(!info)return;const allowed=info.ids.map(id=>products.find(p=>String(p.id)===id)).filter(Boolean);$('voucherIntro').innerHTML='القسيمة المتاحة: <b>'+info.budget+' ج</b><br>اختار منتجات من القائمة بقيمة لا تتجاوز القسيمة. المنتجات المختارة هتدخل في نفس الطلب بسعر <b>0 جنيه</b>.';$('voucherProducts').innerHTML=allowed.map(p=>{const q=Number(voucherPick.selected[p.id]||0),price=Number(p.price)||0,disabled=!q&&voucherSelectedTotal()+price>voucherPick.budget;return '<div class="cartRow" style="border:1px solid #e1e8e2;border-radius:12px;padding:9px"><div style="width:58px;height:58px;overflow:hidden;border-radius:9px">'+mediaTag(p.image||fallback(),p.imageType||p.mediaType||'image')+'</div><div class="cartInfo"><b>'+esc(p.name)+'</b><br><span>'+price+' ج</span></div><div class="cartQty"><button '+(q<=0?'disabled':'')+' onclick="voucherQty(\''+esc(p.id)+'\',-1)">−</button><span>'+q+'</span><button '+(disabled?'disabled':'')+' onclick="voucherQty(\''+esc(p.id)+'\',1)">+</button></div></div>'}).join('');const used=voucherSelectedTotal();$('voucherSummary').innerHTML='<div class="sum"><span>قيمة القسيمة</span><b>'+voucherPick.budget+' ج</b></div><div class="sum"><span>القيمة المختارة</span><b>'+used+' ج</b></div><div class="sum final"><span>المتبقي</span><b>'+Math.max(0,voucherPick.budget-used)+' ج</b></div>';}
function showVoucherProducts(){
  const item=cart.find(x=>String(x.id)===String(voucherPick.mainId)&&!x.isGift&&!x.isVoucher);
  const info=voucherInfoFor(item);
  if(!info){toast('أضف المنتج الأساسي للسلة أولًا، ثم افتح القسيمة من السلة.');return;}
  const allowed=info.ids.map(id=>products.find(p=>String(p.id)===String(id))).filter(Boolean);
  if(!allowed.length){toast('لا توجد منتجات مؤهلة للقسيمة حاليًا.');return;}
  const hero=$('voucherWelcome'),list=$('voucherList'),apply=$('voucherApplyBtn');
  if(hero)hero.style.display='none';
  if(list)list.classList.add('show');
  if(apply)apply.style.display='block';
  renderVoucherPicker();
  const sc=$('voucherModal')?.querySelector('.gm-voucher-scroll');if(sc)sc.scrollTo({top:0,behavior:'smooth'});
}
function gmSkipNotifications(){localStorage.setItem('gm_push_skipped','1');localStorage.setItem('gm_push_required_ok','1');const g=$('gmNotificationGate');if(g){g.classList.remove('open');g.setAttribute('aria-hidden','true')}const err=$('gmGateError');if(err)err.classList.remove('show');}
function voucherQty(id,delta){const q=Math.max(0,Number(voucherPick.selected[id]||0)+delta);const p=products.find(x=>String(x.id)===String(id));if(delta>0&&p&&voucherSelectedTotal()+(Number(p.price)||0)>voucherPick.budget)return;if(q)voucherPick.selected[id]=q;else delete voucherPick.selected[id];renderVoucherPicker();}
function openVoucherPicker(mainId){const item=cart.find(x=>String(x.id)===String(mainId)&&!x.isGift&&!x.isVoucher),info=voucherInfoFor(item);if(!info)return;voucherPick={mainId:String(mainId),budget:info.budget,selected:{}};openM('voucherModal');const list=$('voucherList'),hero=$('voucherWelcome'),apply=$('voucherApplyBtn');if(list)list.classList.remove('show');if(hero)hero.style.display='block';if(apply)apply.style.display='none';const sc=$('voucherModal')?.querySelector('.gm-voucher-scroll');if(sc)sc.scrollTop=0;const hv=$('voucherHeroValue');if(hv)hv.textContent=info.budget+' جنيه';renderVoucherPicker();}
function applyVoucherSelection(){const used=voucherSelectedTotal();if(!used){toast&&toast('اختار منتج واحد على الأقل بالقسيمة');return;}cart=cart.filter(x=>!(x.isVoucher&&String(x.mainProductId)===String(voucherPick.mainId)));for(const [id,q] of Object.entries(voucherPick.selected)){const p=products.find(x=>String(x.id)===String(id));if(!p)continue;cart.push({id:'voucher:'+voucherPick.mainId+':'+id,productId:p.id,name:p.name,price:0,oldPrice:Number(p.price)||0,shippingPrice:0,image:p.image||fallback(),imageType:p.imageType||p.mediaType||'image',quantity:q,isVoucher:true,mainProductId:voucherPick.mainId,voucherValue:Number(p.price)||0});}closeM('voucherModal');updateCart();toast('تمت إضافة منتجات القسيمة للسلة مجانًا ✓');openM('cartModal');}
function updateCart(){syncGifts();let count=cart.filter(x=>!x.isGift&&!x.isVoucher).reduce((s,x)=>s+x.quantity,0);$('count').textContent=count;$('cartItems').innerHTML=cart.length?cart.map((x,i)=>'<div class="cartRow '+(x.isGift||x.isVoucher?'gm-cart-gift':'')+'"><div style="width:62px;height:62px;border-radius:10px;overflow:hidden;flex:0 0 auto">'+mediaTag(x.image,x.imageType||'image')+'</div><div class="cartInfo"><b>'+esc(x.name)+'</b><br>'+(x.isGift?'<span class="gm-zero">🎁 هدية — 0 ج</span>':(x.isVoucher?'<span class="gm-zero">🎟️ بالقسيمة — 0 ج</span>':x.price+' ج × '+x.quantity))+'</div>'+((x.isGift||x.isVoucher)?'':('<div class="cartQty"><button onclick="cartQ('+i+',-1)">−</button>'+x.quantity+'<button onclick="cartQ('+i+',1)">+</button></div>'))+'</div>').join(''):'<p>السلة فارغة.</p>';let paid=cart.filter(x=>!x.isGift&&!x.isVoucher),voucherItems=cart.filter(x=>x.isVoucher),pt=paid.reduce((s,x)=>s+x.price*x.quantity,0),orig=paid.reduce((s,x)=>s+(x.oldPrice>x.price?x.oldPrice:x.price)*x.quantity,0),discount=Math.max(0,orig-pt),ship=paid.length?Math.max(+settings.shipping||0,...paid.map(x=>+x.shippingPrice||0)):0;let promoDiscount=Math.min(pt,Math.max(0,+promo.discount||0));if(promo.freeShipping)ship=0;let giftNames=[...new Set(cart.filter(x=>x.isGift).map(x=>x.name).filter(Boolean))];$('cartItems').insertAdjacentHTML('beforeend',cart.filter(x=>!x.isGift&&!x.isVoucher&&voucherInfoFor(x)).map(x=>'<button class="submit" style="margin-top:7px;background:#e8f4ed;color:#0b5b3d;border:1px solid #cfe3d5" onclick="openVoucherPicker(\''+esc(x.id)+'\')">🎟️ اختر منتجات القسيمة — بقيمة '+(voucherInfoFor(x)?.budget||0)+' ج</button>').join(''));$('summary').innerHTML='<div class="sum"><span>قبل الخصم</span><b>'+orig+' ج</b></div><div class="sum"><span>💚 خصم المنتجات</span><b>− '+discount+' ج</b></div><div class="sum"><span>المنتجات بعد الخصم</span><b>'+pt+' ج</b></div>'+(promoDiscount?'<div class="sum" style="color:#087842"><span>🎟️ بروموكود '+esc(promo.code)+'</span><b>− '+promoDiscount+' ج</b></div>':'')+'<div class="sum"><span>🚚 التوصيل مرة واحدة</span><b>'+ship+' ج</b></div>'+(giftNames.length?'<div class="sum"><span>🎁 الهدايا</span><b class="gm-zero">'+esc(giftNames.join('، '))+' — 0 ج</b></div>':'')+(voucherItems.length?'<div class="sum"><span>🎟️ منتجات بالقسيمة</span><b class="gm-zero">'+esc([...new Set(voucherItems.map(x=>x.name))].join('، '))+' — 0 ج</b></div>':'')+'<div class="sum final"><span>الإجمالي</span><b>'+(Math.max(0,pt-promoDiscount)+ship)+' ج</b></div>';window.cartTotals={pt,ship,total:Math.max(0,pt-promoDiscount)+ship,promoDiscount,promoCode:promo.code}}
function cartQ(i,n){if(cart[i]?.isGift||cart[i]?.isVoucher)return;const mainId=cart[i]?.id;cart[i].quantity+=n;cart=cart.filter(x=>!(x.isVoucher&&String(x.mainProductId)===String(mainId)));if(cart[i].quantity<1)cart.splice(i,1);if(promo.code)clearPromo('غيّرت السلة، طبّق البروموكود مرة أخرى.');else updateCart()}

function clearPromo(msg){promo={code:'',discount:0,freeShipping:false};if($('promoMsg'))$('promoMsg').innerHTML=msg||'';if($('promoCode'))$('promoCode').value='';updateCart()}
function cartQ(i,n){cart[i].quantity+=n;if(cart[i].quantity<1)cart.splice(i,1);if(promo.code)clearPromo('غيّرت السلة، طبّق البروموكود مرة أخرى.');else updateCart()}function cartOpen(){updateCart();openM('cartModal')}function checkoutOpen(){if(!cart.length)return;closeM('cartModal');openM('checkoutModal')}
async function applyPromo(){const code=String($('promoCode')?.value||'').trim().toUpperCase();if(!code){clearPromo('اكتب البروموكود أولًا.');return}const totals=window.cartTotals||{pt:0,ship:0};if(!totals.pt){clearPromo('السلة فارغة.');return}$('promoMsg').innerHTML='<span style="color:#68756e">جاري التحقق...</span>';try{const r=await fetch('/api/promo/validate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code,subtotal:totals.pt,shipping:totals.ship})});const d=await r.json();if(!r.ok)throw Error(d.error||'البروموكود غير صالح');promo={code,discount:Number(d.discount)||0,freeShipping:d.type==='free_shipping'};updateCart();$('promoMsg').innerHTML='<span style="color:#087842;font-weight:800">✓ '+esc(d.message||'تم تطبيق البروموكود')+'</span>'}catch(e){clearPromo('❌ '+esc(e.message))}}
function showOrderStatus(mode,data=''){const box=$('gmOrderStatus');if(!box)return;box.style.display='flex';$('gmOrderLoading').style.display=mode==='loading'?'block':'none';$('gmOrderSuccess').style.display=mode==='success'?'block':'none';$('gmOrderError').style.display=mode==='error'?'block':'none';if(mode==='success'){const id=typeof data==='object'?(data.id||'تم التسجيل'):data;const token=typeof data==='object'?(data.trackingToken||''):'';$('gmOrderNo').textContent=id||'تم التسجيل';if(token){localStorage.setItem('gm_last_tracking_token',token);const u=location.origin+'/track.html?token='+encodeURIComponent(token);$('gmOrderTrack').href=u;window.gmLastTrackingUrl=u}else if(window.gmLastTrackingUrl){$('gmOrderTrack').href=window.gmLastTrackingUrl}}if(mode==='error')$('gmOrderErrorText').textContent=data||'حدث خطأ غير متوقع';document.body.style.overflow='hidden'}
function copyLastTracking(){const u=window.gmLastTrackingUrl||location.origin+'/track.html?token='+encodeURIComponent(localStorage.getItem('gm_last_tracking_token')||'');if(!u.includes('token=')){toast('لسه مفيش طلب محفوظ للتتبع');return}navigator.clipboard?.writeText(u).then(()=>toast('تم نسخ رابط التتبع ✓')).catch(()=>prompt('انسخ رابط التتبع:',u))}
function hideOrderStatus(){const box=$('gmOrderStatus');if(box)box.style.display='none';document.body.style.overflow=''}
async function sendOrder(){let name=$('name').value.trim(),phone=$('phone').value.trim();if(!name||!phone){$('orderMsg').textContent='اكتب الاسم ورقم الهاتف أولًا.';return}const ct=localStorage.getItem('gm_customer_token')||'';let body={name,phone,guestKey:localStorage.getItem('gm_guest_key')||'',governorate:$('gov').value,area:$('area').value,street:$('street').value,building:$('building').value,floor:$('floor').value,apartment:$('apt').value,notes:$('notes').value,items:cart.filter(x=>!x.isGift&&!x.isVoucher).map(x=>({productId:x.id,dealId:x.dealId||'',gmOfferId:x.gmOfferId||'',gmOfferStartedAt:x.gmOfferStartedAt||0,quantity:x.quantity,price:x.price,name:x.name,dealItems:x.dealItems||[]})),gifts:cart.filter(x=>x.isGift).map(x=>({productId:x.productId,mainProductId:x.mainProductId,mainQuantity:x.quantity,name:x.name,price:0})),voucherItems:cart.filter(x=>x.isVoucher).map(x=>({productId:x.productId,mainProductId:x.mainProductId,quantity:x.quantity,name:x.name,price:0,value:Number(x.voucherValue)||0})),productsTotal:cartTotals.pt,shipping:cartTotals.ship,total:cartTotals.total,promoCode:promo.code};showOrderStatus('loading');try{let headers={'content-type':'application/json'};if(ct)headers.authorization='Bearer '+ct;let r=await fetch('/api/orders',{method:'POST',headers,body:JSON.stringify(body)}),d=await r.json();if(!r.ok)throw Error(d.error||'فشل إرسال الطلب');cart=[];promo={code:'',discount:0,freeShipping:false};updateCart();closeM('checkoutModal');showOrderStatus('success',{id:d.order?.id||d.id||d.orderId||'تم تسجيل الطلب',trackingToken:d.order?.trackingToken||d.trackingToken||''});setTimeout(()=>{hideOrderStatus();window.scrollTo({top:0,behavior:'smooth'})},7000)}catch(e){showOrderStatus('error',e.message)}}

function dealList(){return (Array.isArray(settings.deals)?settings.deals:[]).filter(d=>d&&d.active!==false)}
function dealDuration(d){return Math.max(1,Number(d.durationMinutes)||30)*60000}
function dealSchedule(){
const list=dealList();if(!list.length)return [];
const explicit=list.some(d=>d.startAt||d.endAt||d.expiresAt);
if(explicit)return list.map((d,i)=>({...d,_i:i,_start:Date.parse(d.startAt||"")||0,_end:Date.parse(d.endAt||d.expiresAt||"")||0})).filter(d=>!d._end||Date.now()<d._end);
let start=Date.parse(settings.dealsStartAt||"");if(!Number.isFinite(start))start=Date.now();
const durations=list.map(dealDuration),total=durations.reduce((a,b)=>a+b,0),elapsed=Math.max(0,Date.now()-start),offset=total?elapsed%total:0;let cursor=Date.now()-offset;
return list.map((d,i)=>{const st=cursor,en=cursor+durations[i];cursor=en;return {...d,_i:i,_start:st,_end:en}})
}
function activeDeal(){const a=dealSchedule(),now=Date.now();return a.find(d=>now>=d._start&&now<d._end)||null}
function findDeal(id){return dealList().find(d=>String(d.id||"")===String(id))||dealList()[Number(id)]||null}
function dealRemaining(d){return d?Math.max(0,Math.ceil((d._end-Date.now())/1000)):0}
function renderDeals(){
const d=activeDeal();
if(!d){$('dealList').innerHTML='<div class="emptyDeal">لا توجد صفقة نشطة حاليًا. الصفقة القادمة ستظهر تلقائيًا.</div>';return}
const old=Number(d.oldPrice)||0,price=Number(d.price)||0,off=old>price?Math.round((old-price)/old*100):0,save=Math.max(0,old-price),sec=dealRemaining(d),dd=Math.floor(sec/86400),hh=Math.floor(sec%86400/3600),mm=Math.floor(sec%3600/60),ss=sec%60,contents=Array.isArray(d.contents)?d.contents:[],id=esc(d.id||d._i),title=esc(d.title||d.name||'صفقة Green Moon'),desc=esc(d.description||d.shortDescription||'عرض خاص لفترة محدودة من Green Moon');
const items=contents.length?contents.slice(0,8).map(x=>'<div class="dealContentItem"><span class="check">✓</span><span>'+esc(x)+'</span></div>').join(''):'<div class="dealContentItem"><span class="check">✓</span><span>محتويات الصفقة موضحة في التفاصيل</span></div>';
$('dealList').innerHTML='<article class="deal"><div class="dealMedia">'+mediaTag(d.image||fallback(),d.imageType||d.mediaType||'image','alt="'+title+'"')+'</div><div class="dealText"><div class="dealBadge"><span class="limited">⏳ عرض لفترة محدودة</span>'+(off?'<span class="saving">خصم '+off+'%</span>':'')+'</div><h3>'+title+'</h3><p class="dealLead">'+desc+'</p><div class="dealPriceBox"><div class="dealPriceMain">'+(old?'<span class="old">'+old+' ج</span>':'')+'<span class="new">'+price+'</span><span class="currency">جنيه</span></div>'+(save?'<div class="dealSaving"><strong>وفر '+save+' ج</strong>عن السعر الأصلي</div>':'')+'</div><div class="dealSectionTitle">📦 الصفقة بتشمل</div><div class="dealContents">'+items+'</div><div class="dealTimerBox"><div class="dealTimerTitle">🔥 العرض بينتهي خلال</div><div class="dealTimer" id="dealTimer"><div class="dealTimerUnit"><b>'+String(dd).padStart(2,'0')+'</b><span>يوم</span></div><div class="dealTimerUnit"><b>'+String(hh).padStart(2,'0')+'</b><span>ساعة</span></div><div class="dealTimerUnit"><b>'+String(mm).padStart(2,'0')+'</b><span>دقيقة</span></div><div class="dealTimerUnit"><b>'+String(ss).padStart(2,'0')+'</b><span>ثانية</span></div></div></div><div class="dealActions"><button class="order" onclick="dealOrder(\''+id+'\')">🛒 اطلب الصفقة الآن — '+price+' ج</button><button class="more" onclick="dealInfo(\''+id+'\')">👁️ شوف كل تفاصيل الصفقة</button></div><div class="dealUrgency">✔️ السعر الظاهر هو سعر الصفقة بالكامل</div></div></article>'
}
function tick(){const d=activeDeal(),el=$('dealTimer');if(!d){if(dealList().length)renderDeals();return}if(el){const sec=dealRemaining(d),dd=Math.floor(sec/86400),hh=Math.floor(sec%86400/3600),mm=Math.floor(sec%3600/60),ss=sec%60;el.innerHTML='<div class="dealTimerUnit"><b>'+String(dd).padStart(2,'0')+'</b><span>يوم</span></div><div class="dealTimerUnit"><b>'+String(hh).padStart(2,'0')+'</b><span>ساعة</span></div><div class="dealTimerUnit"><b>'+String(mm).padStart(2,'0')+'</b><span>دقيقة</span></div><div class="dealTimerUnit"><b>'+String(ss).padStart(2,'0')+'</b><span>ثانية</span></div>';if(sec<=0)renderDeals()}else renderDeals()}
function dealOrder(id){
const d=findDeal(id);if(!d)return;const active=activeDeal();
if(!active||String(active.id||active._i)!==String(id)){alert('الصفقة انتهت أو غير متاحة حاليًا.');renderDeals();return}
const items=Array.isArray(d.items)?d.items:(Array.isArray(d.productIds)?d.productIds.map(productId=>({productId,quantity:1})):(d.productId?[{productId:d.productId,quantity:1}]:[]));
const valid=items.map(it=>({p:products.find(x=>String(x.id)===String(it.productId)),quantity:Math.max(1,Number(it.quantity)||1)})).filter(x=>x.p);
if(!valid.length){alert('مكونات الصفقة غير متاحة حاليًا.');return}
const dealId=String(d.id||id),old=Number(d.oldPrice)||0,price=Number(d.price)||0;let x=cart.find(v=>v.isDeal&&String(v.dealId)===dealId);
if(x)x.quantity+=1;else{const shipping=Math.max(Number(settings.shipping)||0,...valid.map(v=>Number(v.p.shippingPrice)||0));cart.push({id:'deal-'+dealId,dealId,isDeal:true,name:d.title||d.name||'صفقة Green Moon',price,oldPrice:old,shippingPrice:shipping,image:d.image||valid[0].p.image||fallback(),imageType:d.imageType||valid[0].p.imageType||'image',gift:d.gift||'',quantity:1,dealItems:valid.map(v=>({productId:v.p.id,name:v.p.name,quantity:v.quantity}))})}
updateCart();openM('cartModal')
}
function dealInfo(id){
const d=findDeal(id);if(!d)return;const old=Number(d.oldPrice)||0,price=Number(d.price)||0,items=Array.isArray(d.items)?d.items:(Array.isArray(d.productIds)?d.productIds.map(productId=>({productId,quantity:1})):(d.productId?[{productId:d.productId,quantity:1}]:[])),names=items.map(it=>{const p=products.find(x=>String(x.id)===String(it.productId));return p?p.name+' × '+Math.max(1,Number(it.quantity)||1):''}).filter(Boolean),did=esc(String(d.id||id));
$('dealDetails').innerHTML=mediaTag(d.image||fallback(),d.imageType||d.mediaType||'image')+'<h2>'+esc(d.title||d.name||'صفقة')+'</h2><p style="line-height:1.9">'+esc(d.description||d.shortDescription||'')+'</p><div class="dealPrice">'+(old?'<span class="old">'+old+' ج</span>':'')+'<span class="new">'+price+' ج</span></div><h3>📦 محتويات الصفقة</h3><p style="line-height:1.9">'+esc(names.length?names.join('\n'):(Array.isArray(d.contents)?d.contents.join('\n'):""))+'</p>'+(d.sizes?'<h3>📏 المقاسات</h3><p>'+esc(Array.isArray(d.sizes)?d.sizes.join('، '):d.sizes)+'</p>':'')+(d.features?'<h3>✨ المميزات</h3><p>'+esc(Array.isArray(d.features)?d.features.join('، '):d.features)+'</p>':'')+(d.shipping?'<h3>🚚 الشحن</h3><p>'+esc(d.shipping)+'</p>':'')+(d.notes?'<h3>📝 ملاحظات</h3><p>'+esc(d.notes)+'</p>':'')+'<button class="submit" data-deal-id="'+did+'" onclick="closeM(\'dealModal\');dealOrder(this.dataset.dealId)">🛒 اطلب الصفقة الآن</button>';openM('dealModal')
}
function renderArticles(){let a=settings.gm_articles||settings.articles||[];$('articleList').innerHTML=a.length?a.slice(0,3).map((x,i)=>'<article class="article">'+mediaTag(x.image||fallback(),x.imageType||x.mediaType||'image')+'<div><h3>'+esc(x.title||'مقال')+'</h3><p>'+esc(x.excerpt||x.description||'')+'</p><button onclick="article('+i+')">اقرأ المقال</button></div></article>').join(''):'<p>لا توجد مقالات منشورة حاليًا.</p>'}function article(i){let a=settings.gm_articles||settings.articles||[],x=a[i];if(!x)return;setMediaBox('articleMedia',x.image||fallback(),x.imageType||x.mediaType||'image');$('articleTitle').textContent=x.title||'';$('articleContent').textContent=x.content||x.text||x.description||x.excerpt||'';openM('articleModal')}
function gmMenuClosePage(){const p=$('gmMenuPage');if(p){p.classList.remove('open');p.setAttribute('aria-hidden','true')}}
function gmMenuBack(){gmMenuClosePage();const d=document.querySelector('.drawer');if(d)d.style.display='block'}
function gmMenuClose(){const d=document.querySelector('.drawer');if(d)d.remove();gmMenuClosePage()}
function gmMenuPage(type,title){
 const d=document.querySelector('.drawer');if(d)d.style.display='none';
 const page=$('gmMenuPage'),body=$('gmMenuPageBody'),head=$('gmMenuPageTitle');if(!page||!body)return;
 head.textContent=title||'Green Moon';
 let html='';
 if(type==='deals'){
   html='<div class="gmMenuPageIntro"><h2>🎯 الصفقات والعروض</h2><p>أقوى عروض Green Moon في مكان واحد — اختار عرضك واطلبه مباشرة.</p></div>'+(($('dealList')?.innerHTML||'').trim()||'<div class="gmMenuPageEmpty">لا توجد عروض متاحة حاليًا.</div>');
 } else if(type==='products'){
   html='<div class="gmMenuPageIntro"><h2>🌿 المنتجات</h2><p>كل نباتات ومنتجات Green Moon قدامك في صفحة مستقلة.</p></div><div class="products gmMenuProducts">'+products.map(p=>{const o=+p.oldPrice||0,n=+p.price||0;return '<article class="product" onclick="detail(\''+esc(p.id)+'\')"><div class="pimg">'+mediaTag(p.image||fallback(),p.imageType||p.mediaType||'image')+'</div><div class="pbody"><h3>'+esc(p.name)+'</h3><div class="price">'+(o>n?'<span class="old">'+o+' ج</span>':'')+'<span class="new">'+n+' ج</span></div><button class="add" onclick="event.stopPropagation();add(\''+esc(p.id)+'\')">أضف للسلة 🛒</button></div></article>'}).join('')+'</div>';
 } else if(type==='articles'){
   html='<div class="gmMenuPageIntro"><h2>📰 المقالات</h2><p>نصائح ومعلومات مفيدة تساعدك تختار وتعتني بنباتاتك.</p></div><div class="articles">'+(settings.gm_articles||settings.articles||[]).slice(0,12).map((x,i)=>'<article class="article">'+mediaTag(x.image||fallback(),x.imageType||x.mediaType||'image')+'<div><h3>'+esc(x.title||'مقال')+'</h3><p>'+esc(x.excerpt||x.description||'')+'</p><button onclick="article('+i+')">اقرأ المقال</button></div></article>').join('')+'</div>';
 } else if(type==='notifications'){
   html='<div class="gmMenuPageIntro"><h2>🔔 إشعارات Green Moon</h2><p>العروض والخصومات والصفقات والأخبار وتحديثات طلبك توصلك أول بأول.</p></div><button class="submit" onclick="gmEnableNotifications()">🔔 تفعيل / إعادة تفعيل الإشعارات</button>';
 } else if(type==='doctor'){
   html='<div class="gmMenuPageIntro"><h2>🌿 Green Moon Doctor</h2><p>ابعت صورة نباتك وخلي المساعد يساعدك في معرفة المشكلة والعناية المناسبة.</p></div><button class="submit" onclick="gmMenuClose();doctorOpen()">🔬 افحص نباتك الآن</button>';
 } else if(type==='home'){
   gmMenuClose();window.scrollTo({top:0,behavior:'smooth'});return;
 }
 body.innerHTML=html;page.classList.add('open');page.setAttribute('aria-hidden','false');body.scrollTop=0;
}
function menu(){let d=document.querySelector('.drawer');if(d){d.remove();return}d=document.createElement('div');d.className='drawer';d.innerHTML='<div class="drawerBox"><button class="drawerClose" onclick="menu()">×</button><h2>Green Moon</h2><nav><a href="#" onclick="gmMenuPage(\'home\',\'الرئيسية\');return false">الرئيسية</a><a href="/account.html">👤 حسابي وطلباتي</a><a href="/track.html">📦 تتبع طلب</a><a href="#" onclick="gmMenuPage(\'notifications\',\'الإشعارات\');return false">🔔 الإشعارات</a><a href="#" onclick="gmMenuPage(\'deals\',\'الصفقات والعروض\');return false">🎯 الصفقات والعروض</a><a href="#" onclick="gmMenuPage(\'products\',\'المنتجات\');return false">🌿 المنتجات</a><a href="#" onclick="gmMenuPage(\'articles\',\'المقالات\');return false">📰 المقالات</a><a href="#" onclick="gmMenuPage(\'doctor\',\'Green Moon Doctor\');return false">🌿 Green Moon Doctor</a></nav></div>';document.body.appendChild(d)}
function searchSite(){let q=prompt('اكتب اسم النبات أو المنتج');if(q===null)return;let a=products.filter(p=>String(p.name||'').toLowerCase().includes(q.toLowerCase()));renderProducts(a);$('products').scrollIntoView({behavior:'smooth'})}function normalizeCat(v){return String(v??'').toLowerCase().replace(/أ|إ|آ/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/ئ/g,'ي').replace(/ؤ/g,'و').replace(/[ًٌٍَُِّْـ]/g,'').replace(/[^\u0600-\u06FFa-z0-9]+/gi,'')}
function categoryMatches(p,key){
  const cat=normalizeCat(p.category||p.categoryName||p.type||'');
  const name=normalizeCat(p.name||'');
  const k=normalizeCat(key);
  if(!k)return true;
  if(cat && (cat===k || cat.includes(k) || k.includes(cat)))return true;

  const groups=[
    {keys:['عالمالبامبو','البامبو','بامبو'],words:['بامبو','bamboo']},
    {keys:['اسمدهومبيدات','اسمدهومنتجاتالعنايه','الاسمدهومبيدات','الاسمدهوالعنايه'],words:['سماد','اسمدة','اسمده','مبيد','مبيدات','fertilizer']},
    {keys:['فازاتوقصاريو مستلزمات','الفازاتوالاكسسوارات','فازاتوالاكسسوارات'],words:['فاز','فازات','قصرية','قصاري','قصارى','مستلزمات','vase']},
    {keys:['النباتاتالداخليه'],words:['نباتاتداخلية','نباتاتداخليه','داخلية','داخليه','بوتس','مونسترا','اجلونيما','aglaonema','pothos','monstera']},
    {keys:['نباتاتالزينه'],words:['نباتاتزينة','نباتاتزينه','بوتس','مونسترا','اجلونيما','aglaonema','pothos','monstera']}
  ];
  const group=groups.find(g=>g.keys.some(x=>normalizeCat(x)===k));
  if(group)return group.words.some(w=>cat.includes(normalizeCat(w))||name.includes(normalizeCat(w)));

  const parts=k.match(/[a-z0-9]+|[\u0600-\u06FF]{2,}/g)||[];
  return parts.some(w=>cat.includes(w)||name.includes(w));
}
function catFilter(key){
  const categoryName=String(key||'').trim();
  const list=products.filter(p=>categoryMatches(p,categoryName));
  renderProducts(list);
  let title=document.querySelector('#products .title h2');
  if(title)title.textContent=list.length?'منتجات: '+categoryName:'لا توجد منتجات في هذه الفئة';
  let el=$('products');
  if(el)el.scrollIntoView({behavior:'smooth'});
}
function showAllProducts(){renderProducts(products);let title=document.querySelector('#products .title h2');if(title)title.textContent='وصل حديثًا';let el=$('products');if(el)el.scrollIntoView({behavior:'smooth'});}
function doctorOpen(){openM('doctorModal')}function doctorRun(){let f=$('doctorFile').files[0];if(!f)return $('doctorMsg').textContent='اختار صورة أولًا.';let r=new FileReader;r.onload=async()=>{let data=r.result;$('doctorMsg').textContent='جاري الكشف... الدكتور بيفكر في الحالة 🤔';$('doctorMsg').classList.add('show');try{let res=await fetch('/api/doctor/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({image:data})}),d=await res.json();if(!res.ok)throw Error(d.error||'فشل التحليل');$('doctorMsg').textContent='تم الكشف — دي النتيجة المبدئية 🌿';$('doctorMsg').classList.add('show');$('doctorResult').style.display='block';$('doctorResult').textContent=d.result||'لم يتم الحصول على نتيجة.'}catch(e){$('doctorMsg').textContent=e.message}};r.readAsDataURL(f)}
function ensureGuestKey(){let k=localStorage.getItem('gm_guest_key');if(!k){k='G-'+crypto.randomUUID();localStorage.setItem('gm_guest_key',k)}return k}
ensureGuestKey();
function customerToken(){return localStorage.getItem('gm_customer_token')||''}
function gmUrl64(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
async function gmEnableNotifications(){try{if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){toast('المتصفح لا يدعم إشعارات المتجر');return false}const p=await Notification.requestPermission();if(p!=='granted'){toast('تم رفض إذن الإشعارات');return false}const reg=await navigator.serviceWorker.register('/sw.js');const cfg=await fetch('/api/push/config').then(r=>r.json());let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:gmUrl64(cfg.publicKey)});const h={'content-type':'application/json'};const t=customerToken();if(t)h.authorization='Bearer '+t;await fetch('/api/push/subscribe',{method:'POST',headers:h,body:JSON.stringify({subscription:sub.toJSON(),guestKey:ensureGuestKey(),orderUpdates:true,promotions:true,newProducts:true,news:true,deals:true})});localStorage.setItem('gm_push_enabled','1');toast('تم تفعيل إشعارات Green Moon 🔔');return true}catch(e){toast('تعذر تفعيل الإشعارات');return false}}
async function gmMandatoryEnableNotifications(){
 const btn=$('gmGateBtn'),err=$('gmGateError');if(btn)btn.disabled=true;if(err){err.classList.remove('show');err.textContent=''}
 try{const ok=await gmEnableNotifications();if(ok){localStorage.setItem('gm_push_required_ok','1');localStorage.removeItem('gm_push_skipped');const g=$('gmNotificationGate');if(g){g.classList.remove('open');g.setAttribute('aria-hidden','true')}}else if(err){err.textContent='لم يتم تفعيل الإشعارات. تقدر تفعّلها لاحقًا أو تختار تخطي والدخول للموقع.';err.classList.add('show')}}catch(e){if(err){err.textContent='تعذر التفعيل الآن. يمكنك تخطي الخطوة والدخول للموقع.';err.classList.add('show')}}finally{if(btn)btn.disabled=false}}
async function gmEnsureMandatoryNotifications(){
 const gate=$('gmNotificationGate');if(!gate)return true;
 if(localStorage.getItem('gm_push_required_ok')==='1'||localStorage.getItem('gm_push_skipped')==='1'){gate.classList.remove('open');gate.setAttribute('aria-hidden','true');return true}
 try{
   if(!('Notification' in window)||!('PushManager' in window)||!('serviceWorker' in navigator)){
     const err=$('gmGateError');if(err){err.textContent='المتصفح لا يدعم الإشعارات. يمكنك تخطي الخطوة والدخول للموقع، أو فتحه لاحقًا في Chrome.';err.classList.add('show')}
     gate.classList.add('open');gate.setAttribute('aria-hidden','false');return false;
   }
   const reg=await navigator.serviceWorker.register('/sw.js');
   const existing=await reg.pushManager.getSubscription();
   if(Notification.permission==='granted'&&existing){localStorage.setItem('gm_push_enabled','1');gate.classList.remove('open');gate.setAttribute('aria-hidden','true');return true}
   const err=$('gmGateError');
   if(Notification.permission==='denied'&&err){err.textContent='الإشعارات محظورة من إعدادات المتصفح. تقدر تدخل للموقع الآن وتفعّلها لاحقًا من إعدادات الموقع.';err.classList.add('show')}
   gate.classList.add('open');gate.setAttribute('aria-hidden','false');return false;
 }catch(_){const err=$('gmGateError');if(err){err.textContent='تعذر التحقق من دعم الإشعارات. تقدر تخطي الخطوة والدخول للموقع.';err.classList.add('show')}gate.classList.add('open');gate.setAttribute('aria-hidden','false');return false}
}
async function load(){let saved=localStorage.getItem('gm_cart_v2');if(saved){try{cart=JSON.parse(saved)||[]}catch(_){cart=[]}}
try{let [a,b]=await Promise.all([fetch('/api/products'),fetch('/api/settings?ts='+Date.now(),{cache:'no-store'})]);products=await a.json();settings=await b.json();if(!settings||typeof settings!=='object')settings={};applyGmSite();render();updateCart();if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});const qid=new URLSearchParams(location.search).get('product');if(qid){setTimeout(()=>detail(qid),120)}heroTimer=setInterval(()=>{let h=getHeroes();if(h.length>1){heroIndex=(heroIndex+1)%h.length;renderHero()}},5000);setInterval(tick,1000)}catch(e){document.body.innerHTML='<div style="padding:40px;text-align:center;font-family:Cairo">تعذر تحميل المتجر. حدّث الصفحة وحاول مرة أخرى.</div>'}}load();
setTimeout(()=>gmEnsureMandatoryNotifications(),5000);
document.addEventListener('click',e=>{const m=e.target.closest('.modal');if(m&&e.target===m)closeM(m.id)});document.addEventListener('keydown',e=>{if(e.key==='Escape'){const fm=$('gmFinderModal');if(fm&&fm.classList.contains('open'))gmCloseFinder();document.querySelectorAll('.modal.open').forEach(m=>{if(m.id!=='gmFinderModal')closeM(m.id)});const d=document.querySelector('.drawer');if(d)d.remove()}});