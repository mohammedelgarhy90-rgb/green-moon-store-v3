
(function(){
  var splash=document.getElementById('gmPremiumSplash');
  if(!splash)return;
  var start=Date.now();
  function closeSplash(){
    if(!splash || splash.classList.contains('gmSplashOut'))return;
    splash.classList.add('gmSplashOut');
    setTimeout(function(){
      if(splash && splash.parentNode)splash.parentNode.removeChild(splash);
    },650);
  }
  // Keep the welcome motion under 3 seconds, including exit animation.
  setTimeout(closeSplash,2250);
})();
