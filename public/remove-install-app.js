/* Remove the site-level app-install button/menu item only; browser notification support remains enabled. */
(function () {
  'use strict';
  const INSTALL_LABEL = /(?:تثبيت\s+التطبيق|ثبّت\s+التطبيق|ثبت\s+التطبيق|ثبّت\s+تطبيق|ثبت\s+تطبيق|إضافة\s+إلى\s+الشاشة\s+الرئيسية|add\s+to\s+home\s+screen|install\s+app)/i;
  function clean(root) {
    const base = root && root.querySelectorAll ? root : document;
    for (const item of base.querySelectorAll('a,button,[role="menuitem"],[data-install-app]')) {
      const label = (item.innerText || item.getAttribute('aria-label') || item.getAttribute('title') || '').replace(/\s+/g,' ').trim();
      if (!item.hasAttribute('data-install-app') && !INSTALL_LABEL.test(label)) continue;
      const li = item.closest('li');
      if (li && li.querySelectorAll('a,button,[role="menuitem"]').length === 1) li.remove();
      else item.remove();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => clean(document), { once:true });
  else clean(document);
  const observer = new MutationObserver(() => clean(document));
  observer.observe(document.documentElement, { childList:true, subtree:true });
})();
