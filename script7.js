
(function(){
  var S={room:'',x:.5,y:.5};
  var $v=function(id){return document.getElementById(id)};
  function productsNow(){return Array.isArray(products)?products:[]}
  window.gmOpenVisualizer=function(){var m=$v('gmVizModal');if(m){m.classList.add('open');m.setAttribute('aria-hidden','false')}};
  window.gmCloseVisualizer=function(){var m=$v('gmVizModal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true')}};
  window.gmVizReset=function(){
    S={room:'',x:.5,y:.5};
    var f=$v('gmVizFile'),st=$v('gmVizStage'),pin=$v('gmVizPin'),hint=$v('gmVizHint'),res=$v('gmVizResults'),th=$v('gmVizThinking');
    if(f)f.value='';if(st)st.classList.remove('show');if(pin)pin.style.display='none';if(hint)hint.classList.remove('show');if(res){res.classList.remove('show');res.innerHTML=''}if(th)th.classList.remove('show');
  };
  function score(p){
    var s=0,t=((p.name||'')+' '+(p.details||'')+' '+(p.category||'')+' '+(p.type||'')).toLowerCase();
    if(/نبات|plant|pothos|monstera|aglaonema|سانسيفيريا|بوتس|مونسترا|زاميا|بامبو/.test(t))s+=5;
    if(/داخلي|داخل|indoor/.test(t))s+=3;
    if(/بامبو|bamboo/.test(t))s+=2;
    if(Number(p.price)>0)s+=1;
    return s;
  }
  function escapeHtml(s){return String(s??'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function showResults(list){
    var r=$v('gmVizResults');if(!r)return;
    if(!list.length){r.innerHTML='<div class="gm-viz-result"><div style="grid-column:1/-1;text-align:center;padding:15px">مش لاقيين منتجات نباتات متاحة حاليًا.</div></div>';r.classList.add('show');return}
    r.innerHTML='<h4>🌿 ترشيحات Green Moon</h4>'+list.slice(0,3).map(function(p,i){
      var why=i===0?'مناسب كبداية للمكان اللي حددته.':'بديل مناسب للمقارنة.';
      var img=p.visualizerImage||p.image||'/assets/logo.jpg';
      return '<div class="gm-viz-result"><img src="'+escapeHtml(img)+'"><div><b>'+(i+1)+'. '+escapeHtml(p.name||'نبات')+'</b><p>'+why+'</p><span class="price">'+(Number(p.price)||0)+' ج</span><br><button class="gm-viz-buy" onclick="add(\''+escapeHtml(p.id)+'\');gmCloseVisualizer();cartOpen()">أضف للسلة 🛒</button></div></div>';
    }).join('');
    r.classList.add('show');
  }
  window.gmVizAnalyze=function(){
    var ps=productsNow().filter(function(p){return p && (p.image||p.visualizerImage)});
    var top=ps.sort(function(a,b){return score(b)-score(a)}).slice(0,3);
    var th=$v('gmVizThinking'),r=$v('gmVizResults');
    if(r){r.classList.remove('show');r.innerHTML=''}
    if(th)th.classList.add('show');
    /* ضمان: مفيش طلب شبكة ولا انتظار AI في المسار الأساسي. النتيجة خلال أقل من ثانية. */
    setTimeout(function(){if(th)th.classList.remove('show');showResults(top)},650);
  };
  function setPin(e){
    var st=$v('gmVizStage'),pin=$v('gmVizPin');if(!st||!pin)return;
    var rect=st.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;
    S.x=Math.max(0,Math.min(1,x));S.y=Math.max(0,Math.min(1,y));
    pin.style.left=(S.x*100)+'%';pin.style.top=(S.y*100)+'%';pin.style.display='flex';
  }
  var f=$v('gmVizFile');
  if(f)f.addEventListener('change',function(){
    var file=f.files&&f.files[0];if(!file)return;
    var reader=new FileReader();
    reader.onload=function(e){S.room=e.target.result;var img=$v('gmVizRoom');var st=$v('gmVizStage');var hint=$v('gmVizHint');if(img)img.src=S.room;if(st)st.classList.add('show');if(hint)hint.classList.add('show')};
    reader.readAsDataURL(file);
  });
  var st=$v('gmVizStage');if(st)st.addEventListener('click',setPin);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')gmCloseVisualizer()});
})();
