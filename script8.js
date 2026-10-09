
(function(){
  function popup(){return document.getElementById('gmNotifyPopup')}
  window.gmCloseNotifyPopup=function(later){var p=popup();if(!p)return;p.classList.remove('show');p.setAttribute('aria-hidden','true');if(later)localStorage.setItem('gm_notify_popup_seen','1')}
  window.gmActivateFromPopup=async function(){var p=popup();if(p){p.querySelector('.gmNotifyBtn').disabled=true;p.querySelector('.gmNotifyBtn').textContent='جاري التفعيل…'}var ok=await gmEnableNotifications();if(ok){localStorage.setItem('gm_notify_popup_seen','1');gmCloseNotifyPopup(false)}else if(p){p.querySelector('.gmNotifyBtn').disabled=false;p.querySelector('.gmNotifyBtn').textContent='تفعيل الإشعارات 🔔'}}
  window.gmMaybeShowNotifyPopup=function(){
    try{
      if(localStorage.getItem('gm_push_enabled')==='1'||localStorage.getItem('gm_notify_popup_seen')==='1')return;
      if(!('Notification' in window)||Notification.permission==='denied'||Notification.permission==='granted')return;
      var p=popup();if(!p)return;
      setTimeout(function(){p.classList.add('show');p.setAttribute('aria-hidden','false')},2200);
    }catch(_){}
  }
  
})();
