(() => {
  'use strict';
  if (window.__greenMoonAIChatLoaded) return;
  window.__greenMoonAIChatLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
  #gm-ai-launch{position:fixed;z-index:1200;left:18px;bottom:calc(88px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:9px;border:1px solid #e4ca7a;border-radius:999px;background:linear-gradient(135deg,#0b4a34,#073326);color:#fff;padding:11px 15px;box-shadow:0 10px 32px #001d1360;font:800 13px Cairo,Tahoma,sans-serif;cursor:pointer}
  #gm-ai-launch .gm-ai-spark{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#e8c66d;color:#123728;font-size:18px}
  #gm-ai-panel{position:fixed;z-index:1201;left:14px;bottom:calc(145px + env(safe-area-inset-bottom));width:min(390px,calc(100vw - 28px));height:min(610px,calc(100dvh - 180px));min-height:350px;display:none;flex-direction:column;overflow:hidden;border:1px solid #d8c47c;border-radius:20px;background:#fbfcf8;box-shadow:0 22px 70px #00180f55;direction:rtl;font-family:Cairo,Tahoma,sans-serif;color:#193b2d}
  #gm-ai-panel.gm-ai-open{display:flex}
  #gm-ai-head{display:flex;align-items:center;gap:10px;padding:13px 14px;background:linear-gradient(120deg,#073b2c,#0d6044);color:#fff}
  #gm-ai-avatar{width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border:1px solid #d8b45c;border-radius:50%;background:#fff;color:#073b2c;font-size:22px}
  #gm-ai-title{flex:1;min-width:0}#gm-ai-title b{display:block;font-size:14px}#gm-ai-title small{display:block;color:#e9d99c;font-size:10px;margin-top:2px}
  #gm-ai-close{border:1px solid #ffffff42;background:#ffffff12;color:#fff;border-radius:10px;width:34px;height:34px;font-size:22px;line-height:1}
  #gm-ai-messages{flex:1;overflow:auto;padding:13px;background:linear-gradient(#f9fbf6,#f1f6f0);overscroll-behavior:contain}
  .gm-ai-msg{max-width:91%;width:max-content;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.75;font-size:12px;padding:10px 12px;border-radius:14px;margin:0 0 10px}
  .gm-ai-msg.gm-ai-bot{background:#fff;border:1px solid #e0e9df;border-top-right-radius:4px;box-shadow:0 2px 6px #173b2b08}
  .gm-ai-msg.gm-ai-user{margin-right:auto;background:#0b5840;color:#fff;border-top-left-radius:4px}
  .gm-ai-msg.gm-ai-error{background:#fff1ee;border-color:#f1c7bf;color:#8c2d20}
  #gm-ai-typing{display:none;font-size:11px;color:#62786a;padding:0 14px 8px}
  #gm-ai-attach-preview{display:none;align-items:center;gap:9px;padding:8px 12px;border-top:1px solid #e4ebe3;background:#fff}
  #gm-ai-attach-preview img{width:48px;height:48px;object-fit:cover;border-radius:9px;border:1px solid #d8e2d7}
  #gm-ai-attach-name{flex:1;min-width:0;font-size:11px;color:#4c6657;overflow-wrap:anywhere}
  #gm-ai-remove-image{border:0;border-radius:8px;background:#f6e8e4;color:#8c3022;padding:7px 10px;font-weight:800}
  #gm-ai-compose{padding:10px;border-top:1px solid #e0e8df;background:#fff}
  #gm-ai-input-row{display:flex;align-items:flex-end;gap:7px}
  #gm-ai-text{flex:1;min-width:0;max-height:105px;resize:none;border:1px solid #d6e1d5;border-radius:13px;padding:10px 11px;outline:none;background:#fbfcfa;color:#173b2b;font:12px/1.6 Cairo,Tahoma,sans-serif}
  #gm-ai-text:focus{border-color:#4a8a68;box-shadow:0 0 0 3px #0c6b4414}
  #gm-ai-file{display:none}
  .gm-ai-tool{flex:0 0 39px;width:39px;height:39px;border:1px solid #dbe5d9;border-radius:11px;background:#f6f8f3;color:#24553d;font-size:18px}
  #gm-ai-send{background:#d9b85f;color:#173b2b;border:0;font-weight:900;font-size:16px}
  #gm-ai-send:disabled{opacity:.45;cursor:wait}
  #gm-ai-note{font-size:9px;color:#77867a;margin-top:6px;padding:0 2px;line-height:1.5}
  @media(max-width:520px){#gm-ai-launch{left:12px;bottom:calc(76px + env(safe-area-inset-bottom));padding:9px 12px;font-size:12px}#gm-ai-panel{left:8px;right:8px;bottom:calc(126px + env(safe-area-inset-bottom));width:auto;height:min(68dvh,590px);min-height:320px;border-radius:18px}#gm-ai-head{padding:11px 12px}.gm-ai-msg{font-size:12px}}
  @media(prefers-reduced-motion:no-preference){#gm-ai-launch{transition:transform .15s ease,box-shadow .15s ease}#gm-ai-launch:hover{transform:translateY(-2px);box-shadow:0 14px 34px #001d136d}}
  `;
  document.head.appendChild(style);

  const launch = document.createElement('button');
  launch.id = 'gm-ai-launch';
  launch.type = 'button';
  launch.setAttribute('aria-label', 'افتح مساعد جرين مون الذكي');
  launch.innerHTML = '<span class="gm-ai-spark" aria-hidden="true">✦</span><span>اسأل جرين مون</span>';

  const panel = document.createElement('section');
  panel.id = 'gm-ai-panel';
  panel.setAttribute('aria-label', 'مساعد Green Moon الذكي');
  panel.innerHTML = `
    <header id="gm-ai-head"><div id="gm-ai-avatar" aria-hidden="true">🌿</div><div id="gm-ai-title"><b>Green Moon Assistant</b><small>مساعد النباتات وخدمة العملاء</small></div><button id="gm-ai-close" type="button" aria-label="إغلاق الشات">×</button></header>
    <div id="gm-ai-messages" aria-live="polite" aria-relevant="additions text"></div>
    <div id="gm-ai-typing">المساعد بيجهز الرد…</div>
    <div id="gm-ai-attach-preview"><img id="gm-ai-preview-img" alt="معاينة الصورة المرفقة"><span id="gm-ai-attach-name"></span><button id="gm-ai-remove-image" type="button">إزالة</button></div>
    <div id="gm-ai-compose"><div id="gm-ai-input-row"><input id="gm-ai-file" type="file" accept="image/jpeg,image/png,image/webp,image/*"><button class="gm-ai-tool" id="gm-ai-attach" type="button" aria-label="إرفاق صورة" title="ارفع صورة من الموبايل">＋</button><textarea id="gm-ai-text" rows="1" maxlength="1800" placeholder="اكتب سؤالك عن النباتات أو العروض…"></textarea><button class="gm-ai-tool" id="gm-ai-send" type="button" aria-label="إرسال">➤</button></div><div id="gm-ai-note">تقدر ترفق صورة من الموبايل. تحليل الصور إرشادي وليس تشخيصًا مؤكدًا.</div></div>`;
  document.body.append(launch, panel);

  const messagesEl = panel.querySelector('#gm-ai-messages');
  const input = panel.querySelector('#gm-ai-text');
  const fileInput = panel.querySelector('#gm-ai-file');
  const attachPreview = panel.querySelector('#gm-ai-attach-preview');
  const previewImg = panel.querySelector('#gm-ai-preview-img');
  const attachName = panel.querySelector('#gm-ai-attach-name');
  const sendBtn = panel.querySelector('#gm-ai-send');
  const typing = panel.querySelector('#gm-ai-typing');
  let selectedImage = '';
  let selectedFileName = '';
  let sending = false;
  const history = [];

  function addMessage(role, text, error = false) {
    const node = document.createElement('div');
    node.className = `gm-ai-msg ${role === 'assistant' ? 'gm-ai-bot' : 'gm-ai-user'}${error ? ' gm-ai-error' : ''}`;
    node.textContent = String(text || '');
    messagesEl.appendChild(node);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return node;
  }
  function openPanel() {
    panel.classList.add('gm-ai-open');
    launch.setAttribute('aria-expanded', 'true');
    if (!messagesEl.childElementCount) {
      addMessage('assistant', 'أهلًا بيك في Green Moon. أقدر أساعدك في العناية بالنباتات، وأسعار المنتجات والعروض المتاحة. ولو عندك مشكلة في نباتك، ارفع صورة واضحة وأنا هراجع العلامات الظاهرة قدر الإمكان.');
    }
    setTimeout(() => input.focus(), 80);
  }
  function closePanel() { panel.classList.remove('gm-ai-open'); launch.setAttribute('aria-expanded', 'false'); }
  function resizeImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) return reject(new Error('اختار ملف صورة صالح.'));
      if (file.size > 18 * 1024 * 1024) return reject(new Error('الصورة الأصلية كبيرة جدًا. اختار صورة أقل من 18 ميجابايت.'));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('تعذر قراءة الصورة من الجهاز.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('الصورة تالفة أو غير مدعومة. جرّب صورة تانية.'));
        img.onload = () => {
          const maxSide = 1280;
          const ratio = Math.min(1, maxSide / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round((img.naturalWidth || img.width) * ratio));
          canvas.height = Math.max(1, Math.round((img.naturalHeight || img.height) * ratio));
          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) return reject(new Error('المتصفح لا يدعم تجهيز الصورة.'));
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          let data = canvas.toDataURL('image/jpeg', 0.82);
          if (data.length > 3_800_000) data = canvas.toDataURL('image/jpeg', 0.68);
          if (data.length > 4_400_000) return reject(new Error('حجم الصورة بعد التجهيز ما زال كبيرًا. اختار صورة أصغر أو صوّر جزءًا أقرب للنبات.'));
          resolve(data);
        };
        img.src = String(reader.result || '');
      };
      reader.readAsDataURL(file);
    });
  }
  panel.querySelector('#gm-ai-attach').addEventListener('click', () => fileInput.click());
  panel.querySelector('#gm-ai-remove-image').addEventListener('click', () => {
    selectedImage = ''; selectedFileName = ''; fileInput.value = ''; attachPreview.style.display = 'none'; previewImg.removeAttribute('src');
  });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    attachName.textContent = 'جاري تجهيز الصورة…'; attachPreview.style.display = 'flex';
    try {
      selectedImage = await resizeImage(file);
      selectedFileName = file.name || 'صورة النبات';
      previewImg.src = selectedImage;
      attachName.textContent = `${selectedFileName} · جاهزة للإرسال`;
    } catch (error) {
      selectedImage = ''; selectedFileName = ''; fileInput.value = ''; attachPreview.style.display = 'none';
      addMessage('assistant', error.message || 'تعذر تجهيز الصورة.', true);
    }
  });
  async function send() {
    if (sending) return;
    const message = input.value.trim();
    if (!message && !selectedImage) { input.focus(); return; }
    const imageToSend = selectedImage;
    const imageName = selectedFileName;
    sending = true; sendBtn.disabled = true; typing.style.display = 'block';
    addMessage('user', `${message || 'حلل صورة النبات لو سمحت.'}${imageToSend ? `\n[صورة مرفقة: ${imageName || 'صورة النبات'}]` : ''}`);
    input.value = ''; input.style.height = 'auto';
    selectedImage = ''; selectedFileName = ''; fileInput.value = ''; attachPreview.style.display = 'none'; previewImg.removeAttribute('src');
    const historyForRequest = history.slice(-8);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 35000);
      let response;
      try {
        response = await fetch('/api/ai/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, image: imageToSend, history: historyForRequest }),
          signal: controller.signal, cache: 'no-store', credentials: 'same-origin'
        });
      } finally { clearTimeout(timer); }
      let data = {};
      try { data = await response.json(); } catch (_) {}
      if (!response.ok || !data.success || !data.reply) throw new Error(data.error || 'المساعد مش قادر يرد دلوقتي. جرّب مرة تانية.');
      addMessage('assistant', data.reply);
      history.push({ role: 'user', content: message || (imageToSend ? 'أرسل صورة نبات للتحليل.' : '') });
      history.push({ role: 'assistant', content: data.reply });
      if (history.length > 8) history.splice(0, history.length - 8);
    } catch (error) {
      const msg = error && error.name === 'AbortError' ? 'الرد اتأخر بسبب الاتصال. جرّب صورة أصغر أو ابعت السؤال مرة تانية.' : (error.message || 'حصل عطل مؤقت. جرّب مرة تانية.');
      addMessage('assistant', msg, true);
    } finally {
      sending = false; sendBtn.disabled = false; typing.style.display = 'none'; input.focus();
    }
  }
  launch.addEventListener('click', () => panel.classList.contains('gm-ai-open') ? closePanel() : openPanel());
  panel.querySelector('#gm-ai-close').addEventListener('click', closePanel);
  sendBtn.addEventListener('click', send);
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 105) + 'px'; });
  input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && panel.classList.contains('gm-ai-open')) closePanel(); });
})();
