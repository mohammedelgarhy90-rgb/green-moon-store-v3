
(function(){
  document.addEventListener('click',function(e){
    const m=e.target.closest('.modal');
    if(m && e.target===m && m.id!=='gmFinderModal' && typeof window.closeM==='function') window.closeM(m.id);
  });
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape') return;
    const m=[...document.querySelectorAll('.modal.open')].reverse()[0];
    if(m){ if(m.id==='gmFinderModal' && typeof window.gmCloseFinder==='function') window.gmCloseFinder(); else if(typeof window.closeM==='function') window.closeM(m.id); }
    else if(document.querySelector('#gmPostCartOffer.open') && typeof window.closePostCartOffer==='function') window.closePostCartOffer();
  });
})();
