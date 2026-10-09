
(function(){
const GM_QS=[
 {key:'place',title:'هتحط النبات فين؟',desc:'اختار المكان الأقرب، لأن احتياجات النبات بتختلف حسب استخدام المكان.',opts:[
  ['home','🏠','البيت','غرفة معيشة أو غرفة نوم'],['office','💼','المكتب','مكتب أو مساحة عمل'],['reception','🏢','مدخل / ريسبشن','مكان استقبال أو مدخل'],['balcony','🌿','بلكونة / تراس','مكان مفتوح أو قريب من الخارج']]},
 {key:'light',title:'الإضاءة عندك عاملة إزاي؟',desc:'الإجابة دي من أهم العوامل في ترشيح النوع المناسب.',opts:[
  ['high','☀️','إضاءة قوية','شمس أو ضوء قوي أغلب اليوم'],['medium','🌤️','إضاءة متوسطة','ضوء واضح بدون شمس مباشرة معظم الوقت'],['low','🌙','إضاءة ضعيفة','المكان بعيد عن مصدر الضوء'],['unknown','🤷','مش متأكد','هنحسبها كحالة متوسطة مع هامش أمان']]},
 {key:'care',title:'قد إيه تقدر تهتم بالنبات؟',desc:'اختار مستوى العناية اللي يناسب روتينك الحقيقي.',opts:[
  ['easy','💚','عناية سهلة','عايز أقل متابعة ممكنة'],['medium','🌱','اهتمام بسيط','أقدر أتابعه مرة أو مرتين أسبوعيًا'],['high','🌿','بحب العناية','مستعد أتابعه وأهتم بيه باستمرار']]},
 {key:'size',title:'إيه الحجم المناسب للمكان؟',desc:'المقاس بيأثر على شكل المكان وراحة النبات.',opts:[
  ['small','📐','صغير','مناسب للمكاتب والترابيزات والمساحات المحدودة'],['medium','🪴','متوسط','حجم متوازن لمعظم الأماكن'],['large','🌳','كبير','عايز حضور واضح وقطعة ملفتة'],['any','✨','مش فارقة','الأولوية للأفضل توافقًا']]},
 {key:'budget',title:'ميزانيتك قد إيه؟',desc:'هنستخدم الميزانية في ترتيب النتائج، لكن مش هنرشح منتج غير مناسب لمجرد إنه أرخص.',opts:[
  ['b1','💚','لحد 300 ج','اختيارات اقتصادية'],['b2','🌿','300 – 600 ج','ميزانية متوسطة'],['b3','🪴','600 – 1,000 ج','ميزانية مريحة'],['b4','🌳','1,000 – 2,000 ج','اختيارات أكبر أو مميزة'],['b5','👑','أكتر من 2,000 ج','مفتوحة للخيارات الأعلى']] }
];
let gmW={step:0,answers:{},results:[]};

function gmNorm(v){return String(v||'').toLowerCase().replace(/أ|إ|آ/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[ًٌٍَُِّْـ]/g,'').replace(/[^a-z0-9\u0600-\u06FF]+/g,'')}
function gmCat(p){return gmNorm(p.category||p.categoryName||p.type||'')}
function gmName(p){return gmNorm(p.name||'')}
function gmPrice(p){return Number(p.price)||0}
function gmBudgetRange(k){return ({b1:[0,300],b2:[300,600],b3:[600,1000],b4:[1000,2000],b5:[2000,Infinity]})[k]||[0,Infinity]}
function gmTextMatch(p,words){const s=gmCat(p)+' '+gmName(p);return words.some(w=>s.includes(gmNorm(w)))}
function gmMeta(p){
 const s=gmCat(p)+' '+gmName(p);
 const meta={places:[],lights:[],care:[],sizes:[]};
 if(gmTextMatch(p,['بامبو','bamboo'])){meta.places=['home','office','reception'];meta.lights=['medium','high'];meta.care=['easy','medium'];meta.sizes=['medium','large']}
 if(gmTextMatch(p,['بوتس','pothos'])){meta.places=['home','office'];meta.lights=['low','medium'];meta.care=['easy'];meta.sizes=['small','medium']}
 if(gmTextMatch(p,['مونسترا','monstera'])){meta.places=['home','reception','office'];meta.lights=['medium','high'];meta.care=['medium'];meta.sizes=['medium','large']}
 if(gmTextMatch(p,['سانسيفيريا','snakeplant','sansevieria'])){meta.places=['home','office'];meta.lights=['low','medium','high'];meta.care=['easy'];meta.sizes=['small','medium']}
 if(gmTextMatch(p,['اجلونيما','aglaonema'])){meta.places=['home','office'];meta.lights=['low','medium'];meta.care=['easy','medium'];meta.sizes=['small','medium']}
 if(gmTextMatch(p,['فاز','فازات','vase','قصرية','قصاري'])){meta.places=['home','office','reception'];meta.sizes=['small','medium','large'];}
 if(gmTextMatch(p,['سماد','اسمده','اسمدة','fertilizer','مبيد','عنايه'])){meta.places=['home','office','reception','balcony'];meta.care=['easy','medium','high'];}
 if(!meta.places.length)meta.places=['home','office','reception'];
 if(!meta.lights.length)meta.lights=['medium'];
 if(!meta.care.length)meta.care=['medium'];
 if(!meta.sizes.length)meta.sizes=['medium'];
 return meta;
}
function gmAllCandidates(){
 const arr=[];
 (Array.isArray(products)?products:[]).forEach(p=>{
   const price=gmPrice(p);if(price<=0)return;
   arr.push({p,meta:gmMeta(p),price});
 });
 // Prefer products that have an active related offer when scores are otherwise equal.
 return arr;
}
function gmScore(item){
 const a=gmW.answers,m=item.meta,p=item.p;
 let score=0, reasons=[];
 if(a.place && m.places.includes(a.place)){score+=24;reasons.push('المكان مناسب')}
 else if(a.place){score+=5}
 if(a.light && a.light!=='unknown'){
   if(m.lights.includes(a.light)){score+=27;reasons.push('الإضاءة مناسبة')}
   else if(a.light==='medium'&&m.lights.includes('high'))score+=10;
 }
 else score+=12;
 if(a.care){
   if(m.care.includes(a.care)){score+=20;reasons.push('مستوى العناية مناسب')}
   else if(a.care==='high')score+=8;
 }
 if(a.size && a.size!=='any'){
   if(m.sizes.includes(a.size)){score+=12;reasons.push('الحجم مناسب')}
   else score+=3;
 }else score+=7;
 const [lo,hi]=gmBudgetRange(a.budget);
 if(item.price>=lo && item.price<=hi){score+=17;reasons.push('داخل ميزانيتك')}
 else{
   const d=item.price<lo?lo-item.price:item.price-hi;
   const span=Math.max(300,(hi===Infinity?Math.max(item.price,lo+1):hi-lo));
   score+=Math.max(0,12-Math.min(12,d/span*12));
 }
 // Small penalty for obviously non-plant accessories when user is asking for a plant.
 if(gmTextMatch(p,['سماد','اسمدة','اسمده','فاز','فازات','مبيد','fertilizer','vase']) && a.place!=='office')score-=4;
 return {score:Math.max(0,Math.min(100,Math.round(score))),reasons};
}
function gmBestOffer(p){
 let best=null;
 (Array.isArray(products)?products:[]).forEach(src=>{
  (Array.isArray(src.relatedOffers)?src.relatedOffers:[]).forEach(o=>{
   if(o&&o.active!==false&&String(o.productId)===String(p.id)&&Number(o.offerPrice)>0){
    const x={price:Number(o.offerPrice),old:Number(o.oldPrice)||Number(p.oldPrice)||Number(p.price)||0,text:o.text||''};
    if(!best || x.price<best.price)best=x;
   }
  });
 });
 return best;
}
function gmRenderQuestion(){
 const q=GM_QS[gmW.step],qBox=$('gmWizardQuestion'),cBox=$('gmWizardChoices');if(!q||!qBox||!cBox)return;
 const val=gmW.answers[q.key];
 qBox.innerHTML='<span class="q-kicker">سؤال '+(gmW.step+1)+' من '+GM_QS.length+'</span><h3>'+q.title+'</h3><p>'+q.desc+'</p><div class="gm-question-thinking"><span class="q-char"><svg viewBox="0 0 80 95" aria-hidden="true"><circle cx="40" cy="22" r="15" fill="#f3c7a8"/><path d="M26 22c1-13 8-20 17-20 9 0 15 6 17 15-7-3-13-4-19-1-5 2-9 5-15 6Z" fill="#18392f"/><circle cx="35" cy="24" r="2"/><circle cx="45" cy="24" r="2"/><path d="M35 32c3 2 6 2 9 0" fill="none" stroke="#a15f55" stroke-width="2"/><path d="M23 42c6-5 11-7 17-7s12 2 17 7l5 35H18Z" fill="#0b5b3d"/><path d="M23 47 11 59M57 47l12 11" stroke="#f3c7a8" stroke-width="6" stroke-linecap="round"/><path d="M30 76 27 92M50 76l3 16" stroke="#18392f" stroke-width="8" stroke-linecap="round"/></svg></span><span class="q-msg">'+(gmW.step%2?'لسه بنفكر لك... 🤔':'بنـفكر لك... 🌿')+'<small>بنشوف أنسب اختيار ليك</small></span></div>';
 cBox.innerHTML=q.opts.map(o=>'<button type="button" class="gm-wizard-choice '+(val===o[0]?'selected':'')+'" data-value="'+esc(o[0])+'"><span class="choice-icon">'+o[1]+'</span><b>'+esc(o[2])+'</b><small>'+esc(o[3])+'</small></button>').join('');
 cBox.querySelectorAll('.gm-wizard-choice').forEach(btn=>btn.addEventListener('click',()=>{
   gmW.answers[q.key]=btn.dataset.value;
   // اختيار الإجابة ينتقل تلقائياً للسؤال التالي بعد حركة تفكير قصيرة.
   setTimeout(()=>gmWizardNext(),180);
 }));
 $('gmWizardBack').disabled=gmW.step===0;
 $('gmWizardNext').textContent=gmW.step===GM_QS.length-1?'شوف اختياري ✨':'التالي ←';
 $('gmWizardNext').disabled=!val;
 const pct=Math.round(((gmW.step+1)/GM_QS.length)*100);
 $('gmWizardProgress').style.width=pct+'%';$('gmWizardPercent').textContent=pct+'%';$('gmWizardStepLabel').textContent='السؤال '+(gmW.step+1)+' من '+GM_QS.length;
}
let gmThinkingTimer=null;
function gmWizardThinking(show,title,text){
 const el=$('gmWizardThinking');if(!el)return;
 if(show){
   $('gmThinkingTitle').textContent=title||'ثواني بنفكر لك 🌿';
   $('gmThinkingText').textContent=text||'بنحلل اختيارك ونجهز السؤال اللي بعده...';
   el.classList.add('show');el.setAttribute('aria-hidden','false');
 }else{el.classList.remove('show');el.setAttribute('aria-hidden','true')}
}
function gmWizardNext(){
 const q=GM_QS[gmW.step];if(!q||!gmW.answers[q.key])return;
 if(gmThinkingTimer)clearTimeout(gmThinkingTimer);
 if(gmW.step<GM_QS.length-1){
   gmWizardThinking(true,'ثواني بنفكر لك 🌿','بنحلل إجابتك ونجهز السؤال اللي بعده...');
   gmThinkingTimer=setTimeout(()=>{gmW.step++;gmRenderQuestion();gmWizardThinking(false)},520);
   return;
 }
 gmWizardThinking(true,'جاري اختيار الأنسب ليك ✨','بنقارن إجاباتك بالمكان والإضاءة والعناية والحجم والميزانية...');
 gmThinkingTimer=setTimeout(()=>{gmBuildResults();gmWizardThinking(false)},750);
}
function gmWizardBack(){if(gmW.step>0){gmW.step--;gmRenderQuestion()}}
// Robust mobile navigation: bind the wizard buttons directly as well as the inline handlers.
window.gmWizardNext=gmWizardNext;
window.gmWizardBack=gmWizardBack;
document.addEventListener('click',function(e){
 const nextBtn=e.target.closest&&e.target.closest('#gmWizardNext');
 const backBtn=e.target.closest&&e.target.closest('#gmWizardBack');
 if(nextBtn){e.preventDefault();e.stopPropagation();gmWizardNext();return}
 if(backBtn){e.preventDefault();e.stopPropagation();gmWizardBack();return}
},true);
document.addEventListener('click',function(e){
 const addBtn=e.target.closest&&e.target.closest('[data-gm-add]');
 const detailBtn=e.target.closest&&e.target.closest('[data-gm-detail]');
 const nextBtn=e.target.closest&&e.target.closest('[data-gm-next]');
 if(addBtn){e.preventDefault();e.stopPropagation();gmWizardAdd(addBtn.dataset.gmAdd);return;}
 if(detailBtn){e.preventDefault();e.stopPropagation();detail(detailBtn.dataset.gmDetail);return;}
 if(nextBtn){e.preventDefault();e.stopPropagation();window.gmShowNextProduct(nextBtn.dataset.gmNext);return;}
},true);
function gmBuildResults(){
 const list=gmAllCandidates().map(x=>({...x,...gmScore(x)}));
 list.sort((a,b)=>b.score-a.score || Math.abs(a.price-gmBudgetRange(gmW.answers.budget)[0])-Math.abs(b.price-gmBudgetRange(gmW.answers.budget)[0]));
 gmW.results=list.slice(0,3);gmRenderResults();
}
function gmReason(x){
 const r=x.reasons.slice(0,3);if(!r.length)r.push('توافق عام مع اختياراتك');
 return r.join(' • ');
}
function gmRenderResults(){
 const box=$('gmWizardResult'),body=document.querySelector('#gmRecommendation .gm-wizard-body');if(!box)return;
 if(body)body.style.display='none';box.classList.add('show');
 const top=gmW.results[0];
 if(!top){box.innerHTML='<div class="gm-result-intro"><span class="badge">لم نجد تطابقًا كافيًا</span><h3>خلينا نوسع الاختيارات 🌿</h3><p>جرّب إجابات مختلفة أو ارجع للسؤال السابق.</p></div><button class="gm-result-restart" onclick="gmWizardRestart()">ابدأ من جديد</button>';return}
 const budget=gmBudgetRange(gmW.answers.budget),offerTop=gmBestOffer(top.p);
 box.innerHTML='<div class="gm-result-intro"><span class="badge">✨ اختيارنا الأول ليك</span><h3>'+esc(top.p.name||'منتج Green Moon')+'</h3><p>اعتمدنا على المكان والإضاءة والعناية والحجم والميزانية، ورتبنا النتائج حسب درجة التوافق.</p></div>'+
 '<div class="gm-result-list">'+gmW.results.map((x,i)=>{const off=gmBestOffer(x.p),price=off?off.price:x.price,old=off&&off.old>price?off.old:Number(x.p.oldPrice)||0;return '<article class="gm-result-card '+(i===0?'first':'')+'"><div class="gm-result-img"><span class="gm-result-rank">#'+(i+1)+'</span>'+mediaTag(x.p.image||fallback(),x.p.imageType||x.p.mediaType||'image','alt="'+esc(x.p.name||'Green Moon')+'"')+'</div><div class="gm-result-info"><h4>'+esc(x.p.name||'منتج Green Moon')+'</h4><span class="gm-match">'+x.score+'% تطابق</span><p class="gm-result-reason">'+esc(gmReason(x))+'</p><div class="gm-result-price">'+(old>price?'<span class="old">'+old+' ج</span>':'')+'<span class="new">'+price+' ج</span></div><div class="gm-result-actions"><button type="button" class="gm-result-add" data-gm-add="'+esc(String(x.p.id))+'">🛒 أضف للسلة</button><button type="button" class="gm-result-more" data-gm-detail="'+esc(String(x.p.id))+'">التفاصيل</button><button type="button" class="gm-result-next" data-gm-next="'+esc(String(x.p.id))+'">مش مناسب؟ اللي بعده ←</button></div></div></article>'}).join('')+'</div>'+
 '<div class="gm-result-budget">💰 ميزانيتك: '+esc((GM_QS[4].opts.find(o=>o[0]===gmW.answers.budget)||['','','اختيارك'])[2])+' — الميزانية استخدمناها في ترتيب النتائج، مع الحفاظ على توافق المنتج مع احتياجاتك.</div>'+
 '<button class="gm-result-restart" onclick="gmWizardRestart()">↻ اعمل اختبار جديد</button>';
 box.scrollIntoView({behavior:'smooth',block:'center'});
}
window.gmShowNextProduct=function(id){
 const idx=gmW.results.findIndex(x=>String(x.p.id)===String(id));
 const next=gmW.results[idx+1];
 if(next){const el=document.querySelectorAll('.gm-result-card')[idx+1];if(el)el.scrollIntoView({behavior:'smooth',block:'center'});return;}
 const all=gmAllCandidates().map(x=>({...x,...gmScore(x)})).sort((a,b)=>b.score-a.score);
 const existing=new Set(gmW.results.map(x=>String(x.p.id)));
 const more=all.find(x=>!existing.has(String(x.p.id)));
 if(more){gmW.results.push(more);gmRenderResults();setTimeout(()=>document.querySelectorAll('.gm-result-card')[gmW.results.length-1]?.scrollIntoView({behavior:'smooth',block:'center'}),80);}
 else{const msg=document.createElement('div');msg.className='gm-no-more';msg.textContent='دي آخر ترشيحات مناسبة ليك 🌿';document.querySelector('#gmWizardResult .gm-result-list')?.appendChild(msg);}
};
window.gmWizardAdd=function(id){
 const p=products.find(x=>String(x.id)===String(id));if(!p)return;
 const off=gmBestOffer(p),price=off?off.price:Number(p.price)||0,old=off&&off.old>price?off.old:Number(p.oldPrice)||0;
 let x=cart.find(v=>String(v.id)===String(p.id)&&!v.gmWizardOffer);
 if(x)x.quantity+=1;else cart.push({id:p.id,name:p.name,price,oldPrice:old,shippingPrice:Number(p.shippingPrice)||0,image:p.image||fallback(),imageType:p.imageType||p.mediaType||'image',gift:p.gift||'',quantity:1,gmWizardOffer:true});
 updateCart();if(typeof openM==='function')openM('cartModal');
};
window.gmWizardRestart=function(){
 gmW={step:0,answers:{},results:[]};
 const body=document.querySelector('#gmRecommendation .gm-wizard-body'),box=$('gmWizardResult');
 if(body)body.style.display='';if(box){box.classList.remove('show');box.innerHTML=''}
 gmRenderQuestion();document.getElementById('gmRecommendationSection')?.scrollIntoView({behavior:'smooth',block:'center'});
};
window.gmRecoChoose=function(){};
function gmInitSmartWizard(){
 const sec=$('gmRecommendationSection');if(!sec)return;
 gmRenderQuestion();
}
setTimeout(gmInitSmartWizard,300);
})();
