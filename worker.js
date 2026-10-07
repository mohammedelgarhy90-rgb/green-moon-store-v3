const PRODUCTS_KEY = 'products';
const LOGO_KEY = 'logo';
const SETTINGS_KEY = 'settings';
const ORDERS_KEY = 'orders';
const SHIPPING_KEY = 'shipping';
const DEALS_KEY = 'deals';
const MEDIA_PREFIX = 'media:';
const MAX_MEDIA_BYTES = 12 * 1024 * 1024;
const ACCOUNT_PREFIX = 'acct:';
const SESSION_PREFIX = 'custsess:';
const COURIER_SESSION_PREFIX = 'couriersess:';
const PUSH_PREFIX = 'push:';
const VAPID_KEY = 'vapid_keys';
const ORDER_TOKEN_BYTES = 32;

const SEED_PRODUCTS = [
  {
    id: 1,
    name: 'أجلونيما بينك',
    details: 'نبات أجلونيما بألوان وردي وأخضر مميزة، مناسب للديكور الداخلي.',
    price: 0,
    wholesalePrice: 0,
    shippingPrice: 0,
    care: {},
    image: '/assets/product-1.jpg'
  },
  {
    id: 2,
    name: 'أجلونيما بينك سبوت',
    details: 'أوراق وردية كثيفة بتوزيعات خضراء جميلة.',
    price: 0,
    wholesalePrice: 0,
    shippingPrice: 0,
    care: {},
    image: '/assets/product-2.jpg'
  },
  {
    id: 3,
    name: 'أجلونيما بينك جرين',
    details: 'أجلونيما بأوراق وردية زاهية وتفاصيل خضراء.',
    price: 0,
    wholesalePrice: 0,
    shippingPrice: 0,
    care: {},
    image: '/assets/product-3.jpg'
  },
  {
    id: 4,
    name: 'تشكيلة أجلونيما',
    details: 'مجموعة من نباتات أجلونيما بألوان ونقوش مختلفة.',
    price: 0,
    wholesalePrice: 0,
    shippingPrice: 0,
    care: {},
    image: '/assets/product-4.jpg'
  },
  {
    id: 5,
    name: 'أجلونيما بينك فين',
    details: 'أوراق خضراء بنقوش وردية وعروق وردية واضحة.',
    price: 0,
    wholesalePrice: 0,
    shippingPrice: 0,
    care: {},
    image: '/assets/product-5.jpg'
  },
  {
    id: 6,
    name: 'أجلونيما وايت',
    details: 'أجلونيما بأوراق خضراء وبيضاء، مناسبة للمكاتب والبيوت.',
    price: 0,
    wholesalePrice: 0,
    shippingPrice: 0,
    care: {},
    image: '/assets/product-6.jpg'
  },
  {
    id: 7,
    name: 'بوتس مبرقش',
    details: 'بوتس أخضر بتبرقش فاتح، نبات سهل العناية وسريع النمو.',
    price: 0,
    wholesalePrice: 0,
    shippingPrice: 0,
    care: {},
    image: '/assets/product-7.jpg'
  },
  {
    id: 8,
    name: 'أنثوريوم أبيض',
    details: 'أنثوريوم بأزهار بيضاء وأوراق خضراء أنيقة.',
    price: 0,
    wholesalePrice: 0,
    shippingPrice: 0,
    care: {},
    image: '/assets/product-8.jpg'
  }
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*'
    }
  });
}

function adminOk(request, env) {
  const auth =
    request.headers.get('authorization') || '';

  return !!env.ADMIN_PASSWORD &&
    auth === `Bearer ${env.ADMIN_PASSWORD}`;
}

function normalizeProduct(product) {
  return {
    ...product,
    price:
      Number(product.price) || 0,

    wholesalePrice:
      Number(product.wholesalePrice) || 0,

    shippingPrice:
      Number(product.shippingPrice) || 0,

    giftConfig:
      product.giftConfig && typeof product.giftConfig === 'object'
        ? { enabled: product.giftConfig.enabled === true, products: Array.isArray(product.giftConfig.products) ? product.giftConfig.products : [] }
        : { enabled:false, products:[] },

    voucherConfig:
      product.voucherConfig && typeof product.voucherConfig === 'object'
        ? { ...product.voucherConfig, products: Array.isArray(product.voucherConfig.products) ? product.voucherConfig.products : [] }
        : { enabled:false, value:0, products:[] },

    care:
      product.care &&
      typeof product.care === 'object'
        ? product.care
        : {},

    image:
      product.image ||
      '/assets/logo.jpg'
  };
}

const PRODUCTS_BACKUP_KEY = 'products_backup';
const SETTINGS_BACKUP_KEY = 'settings_backup';
const DEALS_BACKUP_KEY = 'deals_backup';

async function kvJson(env, key, fallback = null) {
  try {
    const raw = await env.GREEN_MOON_KV.get(key);
    if (raw == null || raw === '') return fallback;
    try { return JSON.parse(raw); }
    catch (_) { return fallback; }
  } catch (_) {
    return fallback;
  }
}

async function getProducts(env) {
  let products = await kvJson(env, PRODUCTS_KEY, null);

  if (Array.isArray(products) && products.length) {
    let repaired = false;
    products = products.map((product, index) => {
      const normalized = normalizeProduct(product);
      if (normalized.id === undefined || normalized.id === null || String(normalized.id).trim() === '') {
        repaired = true;
        normalized.id = 'GM-P-' + (Date.now() + index).toString(36).toUpperCase();
      }
      return normalized;
    });
    // Repair legacy products that had no usable id so every product can always be edited/deleted.
    if (repaired) {
      try { await env.GREEN_MOON_KV.put(PRODUCTS_KEY, JSON.stringify(products)); } catch (_) {}
    }
    // Keep a last-known-good snapshot without writing on every public request.
    const backup = await kvJson(env, PRODUCTS_BACKUP_KEY, null);
    if (!Array.isArray(backup) || !backup.length || repaired) {
      try { await env.GREEN_MOON_KV.put(PRODUCTS_BACKUP_KEY, JSON.stringify(products)); } catch (_) {}
    }
    return products;
  }

  const backup = await kvJson(env, PRODUCTS_BACKUP_KEY, null);
  if (Array.isArray(backup) && backup.length) {
    return backup.map(normalizeProduct);
  }

  // Only seed when no catalog exists at all. This preserves the existing behavior.
  products = SEED_PRODUCTS.map(normalizeProduct);
  try { await env.GREEN_MOON_KV.put(PRODUCTS_KEY, JSON.stringify(products)); } catch (_) {}
  return products;
}

async function getLogo(env) {
  return (
    await env.GREEN_MOON_KV.get(
      LOGO_KEY
    )
  ) || '/assets/logo.jpg';
}

async function getShipping(env) {
  const value =
    await env.GREEN_MOON_KV.get(
      SHIPPING_KEY,
      'json'
    );

  return Number(value?.price) || 0;
}

async function getOrders(env) {
  return (
    await env.GREEN_MOON_KV.get(
      ORDERS_KEY,
      'json'
    )
  ) || [];
}

function findPromo(settings, code) {
  const list = Array.isArray(settings?.promoCodes) ? settings.promoCodes : [];
  const wanted = String(code || '').trim().toUpperCase();
  return list.find(x => String(x?.code || '').trim().toUpperCase() === wanted) || null;
}

function promoValidation(promo, subtotal, shipping, usedCount) {
  if (!promo || promo.active === false) return { ok:false, error:'البروموكود غير متاح.' };
  const now = Date.now();
  if (promo.startsAt) { const t=Date.parse(promo.startsAt); if (Number.isFinite(t) && now < t) return {ok:false,error:'البروموكود لم يبدأ بعد.'}; }
  if (promo.endsAt) { const t=Date.parse(promo.endsAt); if (Number.isFinite(t) && now > t) return {ok:false,error:'انتهت صلاحية البروموكود.'}; }
  const minOrder = Math.max(0, Number(promo.minOrder) || 0);
  if (subtotal < minOrder) return {ok:false,error:`الحد الأدنى لاستخدام الكود ${minOrder} جنيه.`};
  const maxUses = Math.max(0, Number(promo.maxUses) || 0);
  if (maxUses && usedCount >= maxUses) return {ok:false,error:'تم الوصول للحد الأقصى لاستخدام البروموكود.'};
  const type = String(promo.type || 'percentage');
  const value = Math.max(0, Number(promo.value) || 0);
  let discount = 0;
  if (type === 'percentage') discount = Math.min(subtotal, Math.round(subtotal * Math.min(100, value) / 100));
  else if (type === 'fixed') discount = Math.min(subtotal, value);
  else if (type === 'free_shipping') discount = Math.max(0, Number(shipping) || 0);
  else return {ok:false,error:'نوع البروموكود غير صحيح.'};
  return {ok:true, type, discount, note:String(promo.note || ''), code:String(promo.code || '').toUpperCase()};
}

function normalizeDeal(deal) {
  const oldPrice = Number(deal.oldPrice) || 0;
  const price = Number(deal.price) || 0;
  const discount = Number(deal.discount) || (oldPrice > price && oldPrice > 0 ? Math.round((1 - price / oldPrice) * 100) : 0);
  return {
    id: deal.id || ('DEAL-' + Date.now().toString(36).toUpperCase()),
    name: String(deal.name || 'صفقة Green Moon'),
    shortDescription: String(deal.shortDescription || deal.description || ''),
    description: String(deal.description || ''),
    image: deal.image || '/assets/logo.jpg',
    price,
    oldPrice,
    discount,
    contents: Array.isArray(deal.contents) ? deal.contents.map(x => String(x)).filter(Boolean) : [],
    sizes: Array.isArray(deal.sizes) ? deal.sizes.map(x => String(x)).filter(Boolean) : [],
    features: Array.isArray(deal.features) ? deal.features.map(x => String(x)).filter(Boolean) : [],
    shipping: String(deal.shipping || ''),
    notes: String(deal.notes || ''),
    expiresAt: deal.expiresAt || '',
    active: deal.active !== false,
    productIds: Array.isArray(deal.productIds) ? deal.productIds : []
  };
}

async function getDeals(env) {
  const deals = await env.GREEN_MOON_KV.get(DEALS_KEY, 'json');
  return Array.isArray(deals) ? deals.map(normalizeDeal) : [];
}


function b64u(bytes) {
  let s = '';
  const a = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  for (const b of a) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function unb64u(s) {
  s = String(s || '').replace(/-/g,'+').replace(/_/g,'/');
  while (s.length % 4) s += '=';
  const bin = atob(s); const out = new Uint8Array(bin.length);
  for (let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i);
  return out;
}
function randomToken(n=32) { const a = new Uint8Array(n); crypto.getRandomValues(a); return b64u(a); }
function normalizePhone(v) { return String(v||'').replace(/[^0-9+]/g,'').replace(/^00/,'+'); }
const PBKDF2_ITERATIONS = 100000;
async function pbkdf2(password, saltB64) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt:unb64u(saltB64),iterations:PBKDF2_ITERATIONS,hash:'SHA-256'}, key, 256);
  return b64u(bits);
}
async function makePassword(password) { const salt=b64u(crypto.getRandomValues(new Uint8Array(16))); return {salt,hash:await pbkdf2(password,salt)}; }
async function claimGuestOrders(env,guestKey,accountId){if(!guestKey||!accountId)return;const orders=await getOrders(env);let changed=false;for(const o of orders){if(o.guestKey===guestKey&&!o.accountId){o.accountId=accountId;changed=true}}if(changed)await env.GREEN_MOON_KV.put(ORDERS_KEY,JSON.stringify(orders.slice(0,500)))}
async function customerSession(request, env) {
  const auth=String(request.headers.get('authorization')||'');
  const token=auth.startsWith('Bearer ')?auth.slice(7).trim():'';
  if(!token)return null;
  const sess=await kvJson(env,SESSION_PREFIX+token,null);
  if(!sess||!sess.accountId||Number(sess.expiresAt||0)<Date.now()) return null;
  return sess;
}
async function accountById(env,id){ return id ? kvJson(env,ACCOUNT_PREFIX+id,null) : null; }
async function safeAccount(a){ if(!a)return null; const {passwordHash,passwordSalt,...safe}=a; return safe; }
async function customerNotificationPrefs(env, accountId) {
  const a=await accountById(env,accountId);
  return a?.notifications || {promotions:true,newProducts:true,orderUpdates:true};
}
function initialTimeline(status='جديد') { return [{status,at:new Date().toISOString(),by:'Green Moon'}]; }
function statusText(status){return String(status||'').trim()}
function publicOrder(o) {
  if(!o)return null;
  return {id:o.id,createdAt:o.createdAt,status:o.status,name:o.name||'',items:o.items||[],gifts:Array.isArray(o.gifts)?o.gifts:[],productsTotal:o.productsTotal||0,shipping:o.shipping||0,promoCode:o.promoCode||'',promoDiscount:o.promoDiscount||0,total:o.total||0,timeline:Array.isArray(o.timeline)?o.timeline:initialTimeline(o.status),trackingUrl:'/track.html?token='+encodeURIComponent(o.trackingToken||'')};
}
async function getVapid(env) {
  let keys=await kvJson(env,VAPID_KEY,null);
  if(keys?.privateJwk && keys?.publicKey) return keys;
  const kp=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
  const privateJwk=await crypto.subtle.exportKey('jwk',kp.privateKey);
  const publicKey=await crypto.subtle.exportKey('raw',kp.publicKey);
  keys={privateJwk,publicKey:b64u(publicKey)};
  await env.GREEN_MOON_KV.put(VAPID_KEY,JSON.stringify(keys));
  return keys;
}
async function hmac(keyBytes, dataBytes){
  const k=await crypto.subtle.importKey('raw',keyBytes,{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC',k,dataBytes));
}
async function hkdfExtract(salt, ikm){return hmac(salt,ikm)}
async function hkdfExpand(prk, info, len){
  let out=new Uint8Array(0), prev=new Uint8Array(0), c=1; const inf=typeof info==='string'?new TextEncoder().encode(info):info;
  while(out.length<len){const data=new Uint8Array(prev.length+inf.length+1);data.set(prev);data.set(inf,prev.length);data[data.length-1]=c++;prev=await hmac(prk,data);const n=new Uint8Array(out.length+prev.length);n.set(out);n.set(prev,out.length);out=n;}
  return out.slice(0,len);
}
async function signVapid(env,audience) {
  const keys=await getVapid(env); const now=Math.floor(Date.now()/1000);
  const enc=o=>b64u(new TextEncoder().encode(JSON.stringify(o)));
  const head=enc({typ:'JWT',alg:'ES256'}), pay=enc({aud:audience,exp:now+12*60*60,sub:'mailto:notifications@greenmoon.local'});
  const input=new TextEncoder().encode(head+'.'+pay);
  const key=await crypto.subtle.importKey('jwk',keys.privateJwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  const sig=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,input);
  return head+'.'+pay+'.'+b64u(sig);
}
async function encryptPush(subscription, payload) {
  const ua=unb64u(subscription.keys.p256dh), auth=unb64u(subscription.keys.auth);
  const eph=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
  const client=await crypto.subtle.importKey('raw',ua,{name:'ECDH',namedCurve:'P-256'},false,[]);
  const shared=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:client},eph.privateKey,256));
  const prkKey=await hkdfExtract(auth,shared);
  const serverPub=new Uint8Array(await crypto.subtle.exportKey('raw',eph.publicKey));
  const info0=new Uint8Array(new TextEncoder().encode('WebPush: info\0').length+ua.length+serverPub.length);
  const prefix=new TextEncoder().encode('WebPush: info\0');info0.set(prefix);info0.set(ua,prefix.length);info0.set(serverPub,prefix.length+ua.length);
  const ikm=await hkdfExpand(prkKey, info0,32);
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const prk=await hkdfExtract(salt,ikm);
  const cek=await hkdfExpand(prk,'Content-Encoding: aes128gcm\0',16);
  const nonce=await hkdfExpand(prk,'Content-Encoding: nonce\0',12);
  const plain=new Uint8Array(new TextEncoder().encode(JSON.stringify(payload)).length+1); plain.set(new TextEncoder().encode(JSON.stringify(payload))); plain[plain.length-1]=2;
  const key=await crypto.subtle.importKey('raw',cek,{name:'AES-GCM'},false,['encrypt']);
  const cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce},key,plain));
  const body=new Uint8Array(16+4+1+serverPub.length+cipher.length); body.set(salt,0); new DataView(body.buffer).setUint32(16,4096); body[20]=serverPub.length; body.set(serverPub,21); body.set(cipher,21+serverPub.length);
  return {body};
}
async function sendPush(env, sub, payload) {
  try {
    const endpoint=String(sub.endpoint||''); if(!endpoint||!sub.keys?.p256dh||!sub.keys?.auth)return false;
    const u=new URL(endpoint); const keys=await getVapid(env); const jwt=await signVapid(env,u.origin);
    const enc=await encryptPush(sub,payload);
    const r=await fetch(endpoint,{method:'POST',headers:{'Authorization':`vapid t=${jwt}, k=${keys.publicKey}`,'Content-Type':'application/octet-stream','Content-Encoding':'aes128gcm','TTL':'86400'},body:enc.body});
    if(r.status===404||r.status===410) return 'gone';
    return r.ok;
  } catch(e){ return false; }
}
async function broadcastPush(env,payload,filterFn=null){
  const list=await env.GREEN_MOON_KV.list({prefix:PUSH_PREFIX,limit:1000});
  for(const k of list.keys){const sub=await kvJson(env,k.name,null);if(!sub)continue;if(filterFn&&!filterFn(sub))continue;const r=await sendPush(env,sub,payload);if(r==='gone'){try{await env.GREEN_MOON_KV.delete(k.name)}catch(_){}}}
}
async function notifyOrder(env,order,title,body){
  const payload={title,body,url:'/track.html?token='+encodeURIComponent(order.trackingToken||''),tag:'order-'+order.id};
  const list=await env.GREEN_MOON_KV.list({prefix:PUSH_PREFIX,limit:1000});
  for(const k of list.keys){const sub=await kvJson(env,k.name,null);if(!sub||sub.orderUpdates===false)continue;if((order.accountId&&sub.accountId===order.accountId)||(order.guestKey&&sub.guestKey===order.guestKey)){const r=await sendPush(env,sub,payload);if(r==='gone')await env.GREEN_MOON_KV.delete(k.name);}}
}


function decodeBase64(base64) {
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  const chunk = 0x8000;
  for (let i = 0; i < bin.length; i += chunk) {
    const part = bin.slice(i, i + chunk);
    for (let j = 0; j < part.length; j++) out[i + j] = part.charCodeAt(j);
  }
  return out;
}

function mediaBytesFromBase64(base64) {
  return Math.floor((String(base64 || '').length * 3) / 4);
}

export default {

  async fetch(request, env, ctx) {

    const url =
      new URL(request.url);

    if (
      request.method === 'OPTIONS'
    ) {
      return new Response('', {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods':
            'GET,POST,PUT,DELETE,OPTIONS',
          'access-control-allow-headers':
            'Content-Type,Authorization'
        }
      });
    }


    /* =========================
       CUSTOMER AUTH
    ========================= */
    if (url.pathname === '/api/auth/register' && request.method === 'POST') {
      try {
        const b=await request.json(); const name=String(b.name||'').trim().slice(0,100); const phone=normalizePhone(b.phone); const password=String(b.password||''); const guestKey=String(b.guestKey||'').slice(0,120);
        if(!name||phone.length<8||password.length<6)return json({error:'اكتب الاسم ورقم صحيح وكلمة مرور 6 أحرف على الأقل.'},400);
        const existing=await env.GREEN_MOON_KV.get('acctphone:'+phone); if(existing)return json({error:'الرقم مسجل بالفعل. سجل دخول بدل إنشاء حساب جديد.'},409);
        const {salt,hash}=await makePassword(password); const id='C-'+randomToken(18); const account={id,name,phone,passwordHash:hash,passwordSalt:salt,createdAt:new Date().toISOString(),notifications:{promotions:true,newProducts:true,orderUpdates:true}};
        await env.GREEN_MOON_KV.put(ACCOUNT_PREFIX+id,JSON.stringify(account)); await env.GREEN_MOON_KV.put('acctphone:'+phone,id); await claimGuestOrders(env,guestKey,id);
        const token=randomToken(32); await env.GREEN_MOON_KV.put(SESSION_PREFIX+token,JSON.stringify({accountId:id,expiresAt:Date.now()+30*86400000}),{expirationTtl:30*86400});
        return json({success:true,token,account:await safeAccount(account)});
      }catch(e){return json({error:String(e?.message||e)},500)}
    }
    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      try { const b=await request.json(); const phone=normalizePhone(b.phone); const guestKey=String(b.guestKey||'').slice(0,120); const id=await env.GREEN_MOON_KV.get('acctphone:'+phone); if(!id)return json({error:'الرقم أو كلمة المرور غير صحيحة.'},401); const a=await accountById(env,id); const h=await pbkdf2(String(b.password||''),a?.passwordSalt||''); if(!a||h!==a.passwordHash)return json({error:'الرقم أو كلمة المرور غير صحيحة.'},401); await claimGuestOrders(env,guestKey,id); const token=randomToken(32); await env.GREEN_MOON_KV.put(SESSION_PREFIX+token,JSON.stringify({accountId:id,expiresAt:Date.now()+30*86400000}),{expirationTtl:30*86400}); return json({success:true,token,account:await safeAccount(a)});}catch(e){return json({error:String(e?.message||e)},500)}
    }
    if (url.pathname === '/api/auth/me' && request.method === 'GET') { const sess=await customerSession(request,env); if(!sess)return json({authenticated:false}); const a=await accountById(env,sess.accountId); return json({authenticated:!!a,account:await safeAccount(a)}); }
    if (url.pathname === '/api/auth/logout' && request.method === 'POST') { const auth=String(request.headers.get('authorization')||''); const t=auth.startsWith('Bearer ')?auth.slice(7).trim():''; if(t)await env.GREEN_MOON_KV.delete(SESSION_PREFIX+t); return json({success:true}); }
    if (url.pathname === '/api/account/orders' && request.method === 'GET') { const sess=await customerSession(request,env); if(!sess)return json({error:'غير مسجل الدخول'},401); const orders=(await getOrders(env)).filter(o=>o.accountId===sess.accountId).map(publicOrder); return json(orders); }
    if (url.pathname === '/api/account/preferences' && (request.method==='GET'||request.method==='PUT')) { const sess=await customerSession(request,env); if(!sess)return json({error:'غير مسجل الدخول'},401); const a=await accountById(env,sess.accountId); if(request.method==='GET')return json(a?.notifications||{promotions:true,newProducts:true,orderUpdates:true}); const b=await request.json(); a.notifications={promotions:b.promotions!==false,newProducts:b.newProducts!==false,orderUpdates:b.orderUpdates!==false}; await env.GREEN_MOON_KV.put(ACCOUNT_PREFIX+a.id,JSON.stringify(a)); return json({success:true,notifications:a.notifications}); }
    if (url.pathname === '/api/push/config' && request.method === 'GET') { const k=await getVapid(env); return json({publicKey:k.publicKey}); }
    if (url.pathname === '/api/push/subscribe' && request.method === 'POST') { try { const b=await request.json(); if(!b.subscription?.endpoint)return json({error:'اشتراك الإشعارات غير صالح'},400); const sess=await customerSession(request,env); const guestKey=String(b.guestKey||'').slice(0,120); const sub={...b.subscription,accountId:sess?.accountId||'',guestKey,orderUpdates:b.orderUpdates!==false,promotions:b.promotions!==false,newProducts:b.newProducts!==false,news:b.news!==false,deals:b.deals!==false,updatedAt:new Date().toISOString()}; const key=PUSH_PREFIX+btoa(sub.endpoint).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,120); await env.GREEN_MOON_KV.put(key,JSON.stringify(sub)); return json({success:true}); }catch(e){return json({error:String(e?.message||e)},500)} }
    if (url.pathname.startsWith('/api/track/') && request.method === 'GET') { const token=decodeURIComponent(url.pathname.slice('/api/track/'.length)); const orders=await getOrders(env); const o=orders.find(x=>x.trackingToken===token); if(!o)return json({error:'رابط التتبع غير صالح أو منتهي.'},404); return json({order:publicOrder(o)}); }
    if (url.pathname === '/api/courier/login' && request.method === 'POST') { const b=await request.json(); const pass=String(b.password||''); const expected=String(env.COURIER_PASSWORD||env.ADMIN_PASSWORD||''); if(!expected||pass!==expected)return json({error:'كود شركة الشحن غير صحيح.'},401); const t=randomToken(24); await env.GREEN_MOON_KV.put(COURIER_SESSION_PREFIX+t,JSON.stringify({expiresAt:Date.now()+12*60*60*1000}),{expirationTtl:43200}); return json({success:true,token:t}); }
    async function courierOk(){ const h=String(request.headers.get('authorization')||''); const t=h.startsWith('Bearer ')?h.slice(7).trim():''; const s=t?await kvJson(env,COURIER_SESSION_PREFIX+t,null):null; return !!s&&Number(s.expiresAt||0)>Date.now(); }
    if (url.pathname === '/api/courier/orders' && (request.method==='GET'||request.method==='PUT')) { if(!await courierOk())return json({error:'غير مصرح'},401); const orders=await getOrders(env); if(request.method==='GET')return json(orders.map(o=>({id:o.id,name:o.name,phone:o.phone,address:[o.governorate,o.area,o.street,o.building&&'عمارة '+o.building,o.floor&&'دور '+o.floor,o.apartment&&'شقة '+o.apartment].filter(Boolean).join(' — '),total:o.total,status:o.status,createdAt:o.createdAt,items:o.items||[],trackingToken:o.trackingToken}))); const b=await request.json(); const i=orders.findIndex(o=>String(o.id)===String(b.id)); if(i<0)return json({error:'الطلب غير موجود'},404); const old=orders[i].status, st=String(b.status||old); orders[i].status=st; orders[i].timeline=Array.isArray(orders[i].timeline)?orders[i].timeline:initialTimeline(old); if(st!==old)orders[i].timeline.push({status:st,at:new Date().toISOString(),by:'شركة الشحن'}); await env.GREEN_MOON_KV.put(ORDERS_KEY,JSON.stringify(orders.slice(0,500))); ctx.waitUntil(notifyOrder(env,orders[i],'🚚 تحديث طلبك من Green Moon',`تم تحديث طلب ${orders[i].id}: ${st}`)); return json({success:true,order:publicOrder(orders[i])}); }

    /* =========================
       PUBLIC PRODUCTS
    ========================= */

    if (
      url.pathname === '/api/products' &&
      request.method === 'GET'
    ) {

      const products =
        await getProducts(env);

      const out = json(products.map(({wholesalePrice, ...product}) => product));
      out.headers.set('cache-control','public, max-age=20, stale-while-revalidate=60');
      return out;
    }

    /* =========================
       PUBLIC DEALS
    ========================= */

    if (
      url.pathname === '/api/deals' &&
      request.method === 'GET'
    ) {
      const deals = (await getDeals(env)).filter(d => d.active);
      return json(deals);
    }

    /* =========================
       PUBLIC LOGO
    ========================= */

    if (
      url.pathname === '/api/logo' &&
      request.method === 'GET'
    ) {

      return json({
        logo:
          await getLogo(env)
      });
    }

    /* =========================
       PUBLIC SETTINGS
    ========================= */

    if (
      url.pathname === '/api/settings' &&
      request.method === 'GET'
    ) {

      let settings = await kvJson(env, SETTINGS_KEY, null);
      if (!settings || typeof settings !== 'object' || Array.isArray(settings) || !Object.keys(settings).length) {
        settings = await kvJson(env, SETTINGS_BACKUP_KEY, null);
      }
      if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
        settings = {
          storeName: 'Green Moon Plants and Flowers',
          title: 'Green Moon 🌿',
          subtitle: 'اختار نباتتك وخلي بيتك أحلى 💚',
          whatsapp: '',
          gm_categories: [],
          gm_hero: [],
          gm_deals: [],
          gm_articles: [],
          gm_home: {},
          services: []
        };
      }
      const out = json(settings);
      out.headers.set('cache-control','no-store, max-age=0');
      return out;
    }

    /* =========================
       PUBLIC SHIPPING
    ========================= */

    if (
      url.pathname === '/api/shipping' &&
      request.method === 'GET'
    ) {

      return json({
        shipping:
          await getShipping(env)
      });
    }

    /* =========================
       GREEN MOON DOCTOR
    ========================= */
    if (url.pathname === '/api/visualizer/analyze' && request.method === 'POST') {
      try {
        const body = await request.json();
        const image = String(body.image || '');
        const note = String(body.note || '').trim().slice(0, 1200);

        if (!image.startsWith('data:image/')) {
          return json({ error: 'الصورة غير صالحة.' }, 400);
        }

        if (image.length > 8_000_000) {
          return json({ error: 'حجم الصورة كبير جدًا. اختار صورة أصغر.' }, 413);
        }

        // استخدم الكتالوج المرسل من الموقع، ولو مش موجود هاته مباشرة من KV.
        let catalog = Array.isArray(body.products)
          ? body.products.slice(0, 80)
          : [];

        if (!catalog.length) {
          catalog = (await getProducts(env))
            .slice(0, 80)
            .map(({ wholesalePrice, ...p }) => p);
        }

        if (!catalog.length) {
          return json({
            recommendations: [],
            source: 'fallback',
            message: 'لا توجد منتجات متاحة للتحليل حاليًا.'
          });
        }

        // ترشيح محلي مضمون حتى لو الـ AI غير متاح أو اتأخر.
        const fallbackScore = (p) => {
          const text = `${p.name || ''} ${p.details || ''} ${p.category || ''}`.toLowerCase();
          const n = note.toLowerCase();
          let score = 0;

          if (/مكتب|ترابيزة|طاولة|سطح/.test(n)) {
            score += /مكتب|ترابيزة|طاولة/.test(text) ? 5 : 1;
          }
          if (/بامبو|pothos|بوتس|مونستيرا|سانسيفيريا|اجلونيما|زاميا|نبات/.test(text)) {
            score += 2;
          }
          if (/صغير|صغيرة|ركن|سطح/.test(n) && /صغير|مكتب|ترابيزة|طاولة/.test(text)) {
            score += 3;
          }
          if (/كبير|أرضية|ركن كبير/.test(n) && /كبير|أرضية|مونستيرا|بامبو/.test(text)) {
            score += 3;
          }

          const price = Number(p.price) || 0;
          if (price > 0) {
            score += 0.01 * Math.max(0, 1000 - Math.min(price, 1000));
          }

          return score;
        };

        const fallback = [...catalog]
          .sort((a, b) => fallbackScore(b) - fallbackScore(a))
          .slice(0, 3)
          .map((p) => ({
            id: String(p.id),
            reason: 'مرشح مناسب للمكان حسب بيانات المنتج المتاحة في المتجر.'
          }));

        // لو Workers AI غير مربوط، رجّع النتيجة المحلية بدل ما الصفحة تفضل معلقة.
        if (!env.AI) {
          return json({
            recommendations: fallback,
            source: 'fallback',
            message: 'تم الاختيار من كتالوج Green Moon.'
          });
        }

        const catalogText = catalog.map(p =>
          `ID=${p.id} | الاسم=${p.name} | السعر=${p.price} | التفاصيل=${String(p.details || '').slice(0, 240)} | القسم=${p.category || ''}`
        ).join('\n');

        const prompt = `أنت مساعد اختيار نباتات لمتجر Green Moon Plants & Flowers.
حلل صورة المكان لاختيار نبات مناسب للموقع الذي حدده العميل.
لا تشخّص صحة الأشخاص ولا تخترع منتجات.

المطلوب: اختر حتى 3 منتجات فقط من الكتالوج المرفق.
راعِ الموضع الذي حدده العميل، والإضاءة الظاهرة، والمساحة، وشكل المكان.
إذا لم تستطع معرفة الإضاءة بدقة، لا تدّعي ذلك.

ملاحظة العميل:
${note}

الكتالوج:
${catalogText}

أرجع JSON فقط:
{"recommendations":[{"id":"ID","reason":"سبب مصري قصير"}]}
استخدم IDs الموجودة حرفيًا فقط.`;

        // حد زمني يمنع الموقع من الانتظار للأبد.
        const aiPromise = env.AI.run(
          '@cf/meta/llama-3.2-11b-vision-instruct',
          {
            prompt,
            image,
            max_tokens: 500,
            temperature: 0.1
          }
        );

        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => resolve(null), 7000)
        );

        const aiResponse = await Promise.race([aiPromise, timeoutPromise]);

        if (!aiResponse) {
          return json({
            recommendations: fallback,
            source: 'fallback',
            message: 'تم اختيار نباتات مناسبة من كتالوج Green Moon.'
          });
        }

        const raw = String(
          aiResponse?.response ||
          aiResponse?.result ||
          ''
        ).trim();

        let parsed = null;

        if (raw) {
          try {
            parsed = JSON.parse(raw);
          } catch (_) {
            const match = raw.match(/\{[\s\S]*\}/);
            if (match) {
              try {
                parsed = JSON.parse(match[0]);
              } catch (_) {}
            }
          }
        }

        const allowed = new Set(catalog.map(p => String(p.id)));

        if (parsed && Array.isArray(parsed.recommendations)) {
          const recommendations = parsed.recommendations
            .filter(x => x && allowed.has(String(x.id)))
            .slice(0, 3)
            .map(x => ({
              id: String(x.id),
              reason: String(x.reason || 'مناسب للمكان').slice(0, 220)
            }));

          if (recommendations.length) {
            return json({
              recommendations,
              source: 'ai'
            });
          }
        }

        return json({
          recommendations: fallback,
          source: 'fallback',
          message: 'تم اختيار نباتات مناسبة من كتالوج Green Moon.'
        });

      } catch (error) {
        // حتى في حالة أي خطأ غير متوقع، لا نرجع خطأ يعلّق الـ Visualizer.
        try {
          const catalog = (await getProducts(env)).slice(0, 3).map(p => ({
            id: String(p.id),
            reason: 'مرشح مناسب من منتجات Green Moon.'
          }));

          return json({
            recommendations: catalog,
            source: 'fallback',
            message: 'تم تشغيل الاختيار الاحتياطي.'
          });
        } catch (_) {
          return json({
            recommendations: [],
            source: 'fallback',
            message: 'تعذر تحليل المكان حاليًا.'
          });
        }
      }
            }
    if (
  url.pathname === '/api/doctor/analyze' &&
  request.method === 'POST'
) {
      try {
        if (!env.AI) {
          return json({
            error: 'Cloudflare Workers AI غير مربوط بالـ Worker.'
          }, 500);
        }

        const body = await request.json();
        const image = String(body.image || '');
        const userNote = String(body.note || '').trim().slice(0, 1000);

        if (!image.startsWith('data:image/')) {
          return json({ error: 'الصورة غير صالحة.' }, 400);
        }

        if (image.length > 8_000_000) {
          return json({
            error: 'حجم الصورة كبير جدًا. اختار صورة أصغر.'
          }, 413);
        }

        const prompt = `
أنت Green Moon Doctor 🌿، مساعد متخصص في تشخيص مشاكل نباتات الزينة وإرشاد أصحابها.

مهمتك الأساسية هنا هي تحليل صورة النبات نفسه، وليس اختيار نبات لمكان.

حلّل الصورة بعناية، واذكر فقط ما تدعمه الصورة أو المعلومات التي أعطاها العميل.
لا تدّعي أن التشخيص مؤكد 100% من الصورة وحدها.
إذا كانت الصورة غير كافية، قل ذلك بوضوح واطلب صورة أو معلومة إضافية بدل اختلاق نتيجة.

قواعد مهمة:
- ابدأ بوصف الأعراض المرئية فقط: اصفرار، بقع، ذبول، احتراق أطراف، تساقط، حشرات ظاهرة، تعفن محتمل... إلخ.
- فرّق بين "الاحتمال الأقرب" و"المؤكد".
- اذكر 1 إلى 3 احتمالات فقط، مرتبة من الأقرب للأبعد بدون استخدام درجات أو نسب مئوية.
- اربط كل احتمال بالعلامات التي ظهرت في الصورة.
- أعطِ خطوات عملية وآمنة يمكن للعميل تنفيذها.
- لا تخترع جرعات مبيدات أو أسمدة.
- إذا اقترحت مبيدًا أو مادة علاجية، اطلب الالتزام بملصق المنتج المحلي والتعليمات الرسمية، ولا تذكر جرعة غير موثقة.
- لا تنصح بخلط مواد كيميائية.
- إذا كان هناك احتمال تعفن جذور، ناقش الري والصرف وفحص الجذور بشكل آمن.
- إذا ظهرت آفة، اذكر أنها آفة محتملة فقط إذا كانت العلامات تدعم ذلك.
- اذكر متى يحتاج العميل لعزل النبات عن باقي النباتات.
- اكتب باللهجة المصرية البسيطة، بشكل واضح ومطمئن ومن غير تهويل.

نظّم النتيجة بالشكل التالي:

🌿 النبات المحتمل:
اسم النبات إن أمكن، مع توضيح درجة الثقة بشكل وصفي مثل "واضح نسبيًا" أو "غير مؤكد".

🔎 اللي ظاهر في الصورة:
اذكر الأعراض المرئية فقط.

🩺 الاحتمال الأقرب:
المشكلة الأكثر احتمالًا ولماذا.

🔄 احتمالات بديلة:
اذكر البدائل عند الحاجة فقط.

💚 تعمل إيه دلوقتي:
خطوات مرتبة وواضحة للعلاج والعناية.

🚫 تجنب:
أهم الأشياء التي قد تزود المشكلة.

📸 لو محتاج صورة تانية:
حدد بالضبط إيه الجزء أو الزاوية أو المعلومة المطلوبة.

معلومة العميل الإضافية:
${userNote || 'لا توجد معلومات إضافية.'}
`;

        const aiResponse = await env.AI.run(
          '@cf/meta/llama-3.2-11b-vision-instruct',
          {
            prompt,
            image,
            max_tokens: 1100,
            temperature: 0.2
          }
        );

        const result =
          aiResponse?.response ||
          aiResponse?.result ||
          '';

        if (!String(result).trim()) {
          return json({
            error: 'Green Moon Doctor لم يُرجع نتيجة.'
          }, 502);
        }

        return json({
          success: true,
          result: String(result).trim()
        });

      } catch (error) {
        return json({
          error: String(
            error?.message ||
            error ||
            'حدث خطأ أثناء تحليل صورة النبات.'
          )
        }, 500);
      }
    }
      if (url.pathname === '/api/doctor/legacy-analyze' && request.method === 'POST') {
      try {

        if (!env.OPENAI_API_KEY) {
          return json(
            {
              error:
                'مفتاح الذكاء الاصطناعي غير مضبوط على Cloudflare.'
            },
            500
          );
        }

        const body =
          await request.json();

        const image =
          String(body.image || '');

        if (
          !image.startsWith('data:image/')
        ) {
          return json(
            {
              error:
                'صورة النبات غير صالحة.'
            },
            400
          );
        }

        if (
          image.length > 8_000_000
        ) {
          return json(
            {
              error:
                'حجم الصورة كبير جدًا. اختار صورة أصغر.'
            },
            413
          );
        }

        const aiResponse =
          await fetch(
            'https://api.openai.com/v1/responses',
            {
              method: 'POST',

              headers: {
                'content-type':
                  'application/json',

                'authorization':
                  `Bearer ${env.OPENAI_API_KEY}`
              },

              body: JSON.stringify({

                model:
                  'gpt-5.6-luna',

                tools: [
                  {
                    type:
                      'web_search'
                  }
                ],

                input: [

                  {
                    role:
                      'system',

                    content: [
                      {
                        type:
                          'input_text',

                        text:
`أنت Green Moon Doctor، مساعد متخصص في إرشاد أصحاب النباتات.

حلّل صورة النبات والأعراض الظاهرة فيها.

مهم جدًا:
- مسموح لك بذكر الاحتمال الأقرب بناءً على الصورة.
- لا تدّعي أن التشخيص مؤكد 100% من الصورة وحدها.
- فرّق بوضوح بين "الاحتمال الأقرب" و"التشخيص المؤكد".
- إذا كانت الصورة غير كافية، اطلب صورة أو معلومات إضافية بدل اختلاق نتيجة.

أجب بالعربية المصرية البسيطة.

نظّم الإجابة بالشكل التالي:

🌿 النبات المحتمل:
اذكر اسم النبات المحتمل، وإن لم تكن متأكدًا وضّح ذلك.

🔎 اللي ظاهر في الصورة:
اذكر الأعراض المرئية فقط.

🩺 الاحتمال الأقرب:
اذكر السبب أو المشكلة المحتملة.

🔄 احتمالات بديلة:
اذكر بدائل عند الحاجة.

💚 تعمل إيه دلوقتي:
أعطِ خطوات آمنة وعملية.

⚠️ تجنب:
اذكر الأشياء التي قد تزيد المشكلة.

📚 المصادر:
عند تقديم علاج أو مكافحة مرض/آفة، استخدم مصادر زراعية موثوقة وابحث عنها قبل التوصية.
اذكر اسم المصدر والرابط.

لا تخترع جرعات مبيدات.
إذا احتاج العلاج إلى مبيد، وضّح أن ملصق المنتج المحلي والتعليمات الرسمية للمنتج هي المرجع النهائي.

لا تقل إن النتيجة مؤكدة 100% من الصورة وحدها.`
                      }
                    ]
                  },

                  {
                    role:
                      'user',

                    content: [

                      {
                        type:
                          'input_text',

                        text:
                          'افحص النبات الموجود في الصورة وحدد الاحتمال الأقرب للمشكلة وقدم إرشادات عملية وآمنة.'
                      },

                      {
                        type:
                          'input_image',

                        image_url:
                          image
                      }
                    ]
                  }
                ]
              })
            }
          );

        const data =
          await aiResponse.json();

        if (!aiResponse.ok) {

          return json(
            {
              error:
                data?.error?.message ||
                'تعذر الاتصال بمحرك Green Moon Doctor.'
            },
            aiResponse.status
          );
        }

        /* =========================
           EXTRACT AI RESULT
        ========================= */

        const extractedText =
          data.output_text ||
          (
            Array.isArray(data.output)
              ? data.output
                  .flatMap(item =>
                    Array.isArray(item?.content)
                      ? item.content
                      : []
                  )
                  .filter(part =>
                    part?.type === 'output_text' &&
                    typeof part?.text === 'string'
                  )
                  .map(part =>
                    part.text
                  )
                                    .join('\n')
              : ''
          ) ||
          ''; 

        if (!extractedText.trim()) {

          return json(
            {
              error:
                'محرك التحليل استقبل الصورة لكنه لم يُرجع نصًا قابلًا للعرض.'
            },
            502
          );
        }

        return json({
          success:
            true,

          result:
            extractedText.trim()
        });

      } catch (error) {

        return json(
          {
            error:
              String(
                error?.message ||
                error
              )
          },
          500
        );
      }
    }
function resolveRelatedOffer(product, offerId) {
  const list = Array.isArray(product?.relatedOffers)
    ? product.relatedOffers
    : [];

  const wanted = String(offerId || '');
  if (!wanted) return null;

  const offer = list.find(
    o => String(o?.offerId || o?.id || '') === wanted
  );

  if (
    !offer ||
    offer.active === false ||
    !(Number(offer.offerPrice) > 0)
  ) {
    return null;
  }

  const durationMinutes =
    Math.max(1, Number(offer.durationMinutes) || 30);

  const sequence =
    Math.max(
      1,
      Number(offer.sequence || offer.order) || 1
    );

  return {
    offerId: wanted,
    price: Number(offer.offerPrice) || 0,
    oldPrice:
      Number(offer.oldPrice) ||
      Number(product.price) ||
      0,
    durationMinutes,
    sequence
  };
}
    /* =========================
       PUBLIC PROMO VALIDATION
    ========================= */

    if (url.pathname === '/api/promo/validate' && request.method === 'POST') {
      try {
        const body = await request.json();
        const settings = await env.GREEN_MOON_KV.get(SETTINGS_KEY, 'json') || {};
        const orders = await getOrders(env);
        const code = String(body.code || '').trim().toUpperCase();
        const usedCount = orders.filter(o => String(o.promoCode || '').toUpperCase() === code).length;
        const subtotal = Math.max(0, Number(body.subtotal) || 0);
        const shipping = Math.max(0, Number(body.shipping) || 0);
        const promo = findPromo(settings, code);
        const result = promoValidation(promo, subtotal, shipping, usedCount);
        if (!result.ok) return json({error:result.error}, 400);
        return json({
          success:true,
          code:result.code,
          type:result.type,
          value:Math.max(0, Number(promo?.value) || 0),
          discount:result.discount,
          shippingDiscount:result.type === 'free_shipping' ? Math.max(0, Number(shipping) || 0) : 0,
          note:result.note || '',
          message:result.note || 'تم تطبيق البروموكود بنجاح 🎉'
        });
      } catch (error) {
        return json({error:String(error?.message || error || 'تعذر التحقق من البروموكود.')},500);
      }
    }

    /* =========================
       CREATE ORDER
    ========================= */

    if (
      url.pathname === '/api/orders' &&
      request.method === 'POST'
    ) {

      try {

        const body =
          await request.json();

        if (
          !body.name ||
          !body.phone ||
          !Array.isArray(body.items) ||
          !body.items.length
        ) {

          return json(
            {
              error:
                'بيانات الطلب غير مكتملة'
            },
            400
          );
        }

        const products =
          await getProducts(env);

        const requestedGifts = Array.isArray(body.gifts) ? body.gifts : [];
        const gifts = [];
        const seenGiftKeys = new Set();
        for (const g of requestedGifts) {
          const mainId = String(g.mainProductId || '');
          const giftId = String(g.productId || '');
          const main = products.find(p => String(p.id) === mainId);
          const gift = products.find(p => String(p.id) === giftId);
          const allowed = main?.giftConfig?.enabled === true && Array.isArray(main.giftConfig.products) && main.giftConfig.products.map(String).includes(giftId);
          const key = mainId + '::' + giftId;
          if (main && gift && allowed && !seenGiftKeys.has(key)) {
            seenGiftKeys.add(key);
            const mainQty = Math.max(1, Number(g.mainQuantity) || 1);
            gifts.push({productId: gift.id, mainProductId: main.id, name: gift.name, price: 0, quantity: mainQty, lineTotal: 0, isGift: true});
          }
        }

        const items =
          body.items
            .map(item => {

              const product =
                products.find(
                  p =>
                    String(p.id) ===
                    String(item.productId)
                );

              if (!product) {
                return null;
              }

              const quantity =
                Math.max(
                  1,
                  Number(item.quantity) || 1
                );

            
const relatedOffer =
  resolveRelatedOffer(
    product,
    item.gmOfferId || ''
  );

const finalPrice =
  relatedOffer
    ? relatedOffer.price
    : (Number(product.price) || 0);

return {
  productId: product.id,
  name: product.name,
  price: finalPrice,
  quantity,
  shippingPrice:
    Number(product.shippingPrice) || 0,
  relatedOfferId:
    relatedOffer?.offerId || '',
  relatedOfferPrice:
    relatedOffer?.price || 0,
  lineTotal:
    finalPrice * quantity
};

            })
            .filter(Boolean);

        if (!items.length) {

          return json(
            {
              error:
                'المنتجات المطلوبة غير موجودة'
            },
            400
          );
        }

        const productsTotal =
          items.reduce(
            (sum, item) =>
              sum + item.lineTotal,
            0
          );

        const generalShipping =
          await getShipping(env);

        const uniqueProductIds =
          [
            ...new Set(
              items.map(
                item =>
                  String(
                    item.productId
                  )
              )
            )
          ];

        let shipping = 0;

        if (
          uniqueProductIds.length === 1
        ) {

          const product =
            products.find(
              p =>
                String(p.id) ===
                uniqueProductIds[0]
            );

          shipping =
            Number(
              product?.shippingPrice
            ) || 0;

        } else {

          shipping =
            generalShipping;
        }

        const settings = await env.GREEN_MOON_KV.get(SETTINGS_KEY, 'json') || {};
        const orders = await getOrders(env);
        const promoCode = String(body.promoCode || '').trim().toUpperCase();
        const usedCount = promoCode ? orders.filter(o => String(o.promoCode || '').toUpperCase() === promoCode).length : 0;
        let promoDiscount = 0;
        let promoShippingDiscount = 0;
        let appliedPromo = null;
        if (promoCode) {
          const promo = findPromo(settings, promoCode);
          const result = promoValidation(promo, productsTotal, shipping, usedCount);
          if (!result.ok) return json({error:result.error},400);
          if (result.type === 'free_shipping') {
            // Free shipping affects shipping only; never subtract it from the products subtotal.
            promoShippingDiscount = Math.max(0, Number(shipping) || 0);
            shipping = 0;
          } else {
            promoDiscount = Math.max(0, Number(result.discount) || 0);
          }
          appliedPromo = {
            code:result.code,
            type:result.type,
            value:Math.max(0, Number(promo?.value) || 0),
            discount:promoDiscount,
            shippingDiscount:promoShippingDiscount
          };
        }
        const total = Math.max(0, productsTotal - promoDiscount) + shipping;

        const customerSess = await customerSession(request, env);
        const guestKey = String(body.guestKey || '').slice(0,120);
        const trackingToken = randomToken(ORDER_TOKEN_BYTES);
        const order = {

          id:
            'GM-' +
            Date.now()
              .toString(36)
              .toUpperCase(),

          createdAt:
            new Date().toISOString(),

          timeline: initialTimeline('جديد'),

          status:
            'جديد',

          trackingToken,

          accountId: customerSess?.accountId || '',

          guestKey,

          name:
            String(
              body.name
            ).slice(0, 120),

          phone:
            String(
              body.phone
            ).slice(0, 40),

          governorate:
            String(
              body.governorate || ''
            ).slice(0, 80),

          area:
            String(
              body.area || ''
            ).slice(0, 120),

          street:
            String(
              body.street || ''
            ).slice(0, 160),

          building:
            String(
              body.building || ''
            ).slice(0, 40),

          floor:
            String(
              body.floor || ''
            ).slice(0, 20),

          apartment:
            String(
              body.apartment || ''
            ).slice(0, 20),

          notes:
            String(
              body.notes || ''
            ).slice(0, 500),

          productsTotal,

          shipping,

          promoCode: appliedPromo?.code || '',

          promoType: appliedPromo?.type || '',

          promoValue: appliedPromo?.value || 0,

          promoDiscount,

          promoShippingDiscount,

          items,

          gifts,

          total
        };

        orders.unshift(order);

        await env.GREEN_MOON_KV.put(
          ORDERS_KEY,
          JSON.stringify(
            orders.slice(0, 500)
          )
        );
        ctx.waitUntil(notifyOrder(env,order,'🌿 تم استلام طلبك','تم استلام طلبك من Green Moon وجاري التجهيز.'));

        return json({
          success:
            true,

          order
        });

      } catch (error) {

        return json(
          {
            error:
              'حدث خطأ أثناء حفظ الطلب',

            details:
              String(
                error?.message ||
                error
              )
          },
          500
        );
      }
    }

    /* =========================
       ADMIN NOTIFICATIONS
    ========================= */
    if (url.pathname === '/api/admin/notifications') {
      if(!adminOk(request,env))return json({error:'غير مصرح'},401);
      if(request.method==='POST'){
        try{const b=await request.json();const title=String(b.title||'🔔 Green Moon').slice(0,120);const body=String(b.body||'').slice(0,500);const urlPath=String(b.url||'/').slice(0,500);const filter=b.audience==='newProducts'?(s=>s.newProducts!==false):b.audience==='promotions'?(s=>s.promotions!==false):b.audience==='news'?(s=>s.news!==false):b.audience==='deals'?(s=>s.deals!==false):(s=>true);ctx.waitUntil(broadcastPush(env,{title,body,url:urlPath,tag:'gm-'+Date.now()},filter));return json({success:true,message:'تم تجهيز الإشعار للإرسال.'});}catch(e){return json({error:String(e?.message||e)},500)}
      }
      return json({error:'Method Not Allowed'},405);
    }

    /* =========================
       ADMIN PRODUCTS
    ========================= */

    if (
      url.pathname ===
      '/api/admin/products'
    ) {

      if (
        !adminOk(
          request,
          env
        )
      ) {

        return json(
          {
            error:
              'غير مصرح'
          },
          401
        );
      }

      if (
        request.method === 'GET'
      ) {

        return json(
          await getProducts(env)
        );
      }

      if (
        request.method === 'POST' ||
        request.method === 'PUT'
      ) {

        try {

          const body =
            await request.json();

          let products =
            await getProducts(env);

          if (
            request.method === 'POST' &&
            !body.id
          ) {

            const newId =
              Date.now();

            const product =
              normalizeProduct({
                ...body,
                id:
                  newId
              });

            products.push(
              product
            );
            ctx.waitUntil(broadcastPush(env,{title:'🌱 منتج جديد في Green Moon',body:`وصل منتج جديد: ${product.name}`,url:'/index.html#products',tag:'new-product-'+product.id},sub=>sub.newProducts!==false));

          } else {

            const index =
              products.findIndex(
                p =>
                  String(p.id) ===
                  String(body.id)
              );

            if (index === -1) {

              return json(
                {
                  error:
                    'المنتج غير موجود'
                },
                404
              );
            }

            products[index] =
              normalizeProduct({
                ...products[index],
                ...body,
                id:
                  products[index].id
              });
          }

          await env.GREEN_MOON_KV.put(PRODUCTS_KEY, JSON.stringify(products));
          try { await env.GREEN_MOON_KV.put(PRODUCTS_BACKUP_KEY, JSON.stringify(products)); } catch (_) {}

          return json({
            success:
              true,

            products
          });

        } catch (error) {

          return json(
            {
              error:
                String(
                  error?.message ||
                  error
                )
            },
            500
          );
        }
      }

      if (
        request.method === 'DELETE'
      ) {

        try {

          const body =
            await request.json();

          const products =
            await getProducts(env);

          const filtered =
            products.filter(
              p =>
                String(p.id) !==
                String(body.id)
            );

          await env.GREEN_MOON_KV.put(PRODUCTS_KEY, JSON.stringify(filtered));
          try { await env.GREEN_MOON_KV.put(PRODUCTS_BACKUP_KEY, JSON.stringify(filtered)); } catch (_) {}

          return json({
            success:
              true,

            products:
              filtered
          });

        } catch (error) {

          return json(
            {
              error:
                String(
                  error?.message ||
                  error
                )
            },
            500
          );
        }
      }
    }

    /* =========================
       ADMIN DEALS
    ========================= */

    if (url.pathname === '/api/admin/deals') {
      if (!adminOk(request, env)) return json({ error: 'غير مصرح' }, 401);

      if (request.method === 'GET') return json(await getDeals(env));

      try {
        let deals = await getDeals(env);
        if (request.method === 'POST') {
          const body = await request.json();
          const deal = normalizeDeal({ ...body, id: body.id || undefined });
          if (deals.some(d => String(d.id) === String(deal.id))) {
            deal.id = 'DEAL-' + Date.now().toString(36).toUpperCase();
          }
          deals.push(deal);
          ctx.waitUntil(broadcastPush(env,{title:'🔥 عرض جديد من Green Moon',body:deal.name,url:'/index.html#deals',tag:'new-deal-'+deal.id},sub=>sub.promotions!==false));
        } else if (request.method === 'PUT') {
          const body = await request.json();
          const index = deals.findIndex(d => String(d.id) === String(body.id));
          if (index === -1) return json({ error: 'الصفقة غير موجودة' }, 404);
          deals[index] = normalizeDeal({ ...deals[index], ...body, id: deals[index].id });
        } else if (request.method === 'DELETE') {
          const body = await request.json();
          deals = deals.filter(d => String(d.id) !== String(body.id));
        } else {
          return json({ error: 'Method Not Allowed' }, 405);
        }

        await env.GREEN_MOON_KV.put(DEALS_KEY, JSON.stringify(deals));
        return json({ success: true, deals });
      } catch (error) {
        return json({ error: String(error?.message || error) }, 500);
      }
    }

    /* =========================
       ADMIN LOGO
    ========================= */

    if (
      url.pathname ===
      '/api/admin/logo'
    ) {

      if (
        !adminOk(
          request,
          env
        )
      ) {

        return json(
          {
            error:
              'غير مصرح'
          },
          401
        );
      }

      if (
        request.method === 'GET'
      ) {

        return json({
          logo:
            await getLogo(env)
        });
      }

      if (
        request.method === 'POST' ||
        request.method === 'PUT'
      ) {

        const body =
          await request.json();

        const logo =
          String(
            body.logo || ''
          );

        await env.GREEN_MOON_KV.put(
          LOGO_KEY,
          logo
        );

        return json({
          success:
            true,

          logo
        });
      }
    }

    /* =========================
       ADMIN SETTINGS
    ========================= */

    if (
      url.pathname ===
      '/api/admin/settings'
    ) {

      if (
        !adminOk(
          request,
          env
        )
      ) {

        return json(
          {
            error:
              'غير مصرح'
          },
          401
        );
      }

      if (
        request.method === 'GET'
      ) {

        return json(
          await env.GREEN_MOON_KV.get(
            SETTINGS_KEY,
            'json'
          ) || {}
        );
      }

      if (
        request.method === 'POST' ||
        request.method === 'PUT'
      ) {

        const body =
          await request.json();

        await env.GREEN_MOON_KV.put(
          SETTINGS_KEY,
          JSON.stringify(
            body
          )
        );

        return json({
          success:
            true,

          settings:
            body
        });
      }
    }

    /* =========================
       ADMIN SHIPPING
    ========================= */

    if (
      url.pathname ===
      '/api/admin/shipping'
    ) {

      if (
        !adminOk(
          request,
          env
        )
      ) {

        return json(
          {
            error:
              'غير مصرح'
          },
          401
        );
      }

      if (
        request.method === 'GET'
      ) {

        return json({
          price:
            await getShipping(env)
        });
      }

      if (
        request.method === 'POST' ||
        request.method === 'PUT'
      ) {

        const body =
          await request.json();

        const price =
          Number(
            body.price ??
            body.shipping ??
            0
          ) || 0;

        await env.GREEN_MOON_KV.put(
          SHIPPING_KEY,
          JSON.stringify({
            price
          })
        );

        return json({
          success:
            true,

          price
        });
      }
    }

    /* =========================
       ADMIN ORDERS
    ========================= */

    if (
      url.pathname ===
      '/api/admin/orders'
    ) {

      if (
        !adminOk(
          request,
          env
        )
      ) {

        return json(
          {
            error:
              'غير مصرح'
          },
          401
        );
      }

      if (
        request.method === 'GET'
      ) {

        return json(
          await getOrders(env)
        );
      }

      if (
        request.method === 'PUT' ||
        request.method === 'POST'
      ) {

        try {

          const body =
            await request.json();

          const orders =
            await getOrders(env);

          const index =
            orders.findIndex(
              order =>
                String(
                  order.id
                ) ===
                String(
                  body.id
                )
            );

          if (index === -1) {

            return json(
              {
                error:
                  'الطلب غير موجود'
              },
              404
            );
          }

          const before=orders[index];
          const nextStatus=String(body.status||before.status||'');
          orders[index] = {
            ...before,
            ...body,
            status: nextStatus,
            timeline: Array.isArray(before.timeline)?before.timeline.slice():initialTimeline(before.status)
          };
          if(nextStatus!==before.status) orders[index].timeline.push({status:nextStatus,at:new Date().toISOString(),by:'Green Moon'});

          await env.GREEN_MOON_KV.put(
            ORDERS_KEY,
            JSON.stringify(
              orders
            )
          );
          if(nextStatus!==before.status) ctx.waitUntil(notifyOrder(env,orders[index],'📦 تحديث طلبك من Green Moon',`تم تحديث طلب ${orders[index].id}: ${nextStatus}`));

          return json({
            success:
              true,

            order:
              orders[index]
          });

        } catch (error) {

          return json(
            {
              error:
                String(
                  error?.message ||
                  error
                )
            },
            500
          );
        }
      }
    }

    /* =========================
       ADMIN RESET
    ========================= */

    if (
      url.pathname ===
      '/api/admin/reset' &&
      request.method === 'POST'
    ) {

      if (
        !adminOk(
          request,
          env
        )
      ) {

        return json(
          {
            error:
              'غير مصرح'
          },
          401
        );
      }

      const products =
        SEED_PRODUCTS.map(
          normalizeProduct
        );

      await env.GREEN_MOON_KV.put(PRODUCTS_KEY, JSON.stringify(products));
      try { await env.GREEN_MOON_KV.put(PRODUCTS_BACKUP_KEY, JSON.stringify(products)); } catch (_) {}

      return json({
        success:
          true,

        products
      });
    }

    /* =========================
       ADMIN HTML ROUTE
    ========================= */

    if (url.pathname === '/admin.html' && request.method === 'GET') {
      if (env.ASSETS) {
        const adminUrl = new URL(request.url);
        adminUrl.pathname = '/admin.html';
        const response = await env.ASSETS.fetch(new Request(adminUrl.toString(), request));
        if (response && response.ok) {
          const out = new Response(response.body, response);
          out.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          out.headers.set('X-Content-Type-Options', 'nosniff');
          return out;
        }
        return response;
      }
      return new Response('admin.html غير موجود في ملفات الموقع', {
        status: 404,
        headers: { 'content-type': 'text/plain;charset=UTF-8' }
      });
    }

    /* =========================
       ADMIN MEDIA UPLOADS
       Supports images + videos anywhere the admin media picker is used.
    ========================= */
    if (url.pathname === '/api/admin/media' && request.method === 'POST') {
      if (!adminOk(request, env)) return json({ error: 'غير مصرح' }, 401);
      try {
        const body = await request.json();
        const data = String(body.data || '');
        const mime = String(body.mime || '').toLowerCase().trim();
        const name = String(body.name || 'media').slice(0, 160);
        if (!data.startsWith('data:') || !/^data:[^;]+;base64,/i.test(data)) {
          return json({ error: 'ملف الوسائط غير صالح.' }, 400);
        }
        const match = data.match(/^data:([^;]+);base64,(.*)$/s);
        const detectedMime = String(match?.[1] || mime).toLowerCase();
        const base64 = String(match?.[2] || '');
        const finalMime = mime || detectedMime;
        if (!(finalMime.startsWith('image/') || finalMime.startsWith('video/'))) {
          return json({ error: 'مسموح فقط بالصور والفيديوهات.' }, 415);
        }
        const bytes = mediaBytesFromBase64(base64);
        if (!bytes || bytes > MAX_MEDIA_BYTES) {
          return json({ error: 'حجم الملف كبير. الحد الأقصى 12 ميجابايت.' }, 413);
        }
        const id = 'GM-MEDIA-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomUUID().slice(0, 8);
        await env.GREEN_MOON_KV.put(MEDIA_PREFIX + id, JSON.stringify({
          mime: finalMime,
          name,
          data: base64,
          createdAt: new Date().toISOString()
        }));
        return json({ success: true, id, url: `/media/${encodeURIComponent(id)}`, mime: finalMime, type: finalMime.startsWith('video/') ? 'video' : 'image' });
      } catch (e) {
        return json({ error: String(e?.message || e || 'تعذر رفع الملف') }, 500);
      }
    }

    /* =========================
       PUBLIC MEDIA DELIVERY
    ========================= */
    if (url.pathname.startsWith('/media/') && request.method === 'GET') {
      try {
        const id = decodeURIComponent(url.pathname.slice('/media/'.length));
        if (!id) return new Response('Not Found', { status: 404 });
        const item = await env.GREEN_MOON_KV.get(MEDIA_PREFIX + id, 'json');
        if (!item?.data || !item?.mime) return new Response('Media Not Found', { status: 404 });
        const bytes = decodeBase64(item.data);
        return new Response(bytes, {
          status: 200,
          headers: {
            'content-type': item.mime,
            'cache-control': 'public, max-age=31536000, immutable',
            'x-content-type-options': 'nosniff',
            'content-disposition': 'inline'
          }
        });
      } catch (e) {
        return new Response('Media Error', { status: 500 });
      }
    }

    /* =========================
       STATIC FILES
    ========================= */

    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      // Cache versioned/static assets aggressively, but keep HTML fresh after deployments.
      if (assetResponse && assetResponse.ok) {
        const response = new Response(assetResponse.body, assetResponse);
        const path = url.pathname.toLowerCase();
        if (path.startsWith('/assets/') || /\.(?:css|js|jpg|jpeg|png|webp|svg|ico|woff2?)$/.test(path)) {
          response.headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
        } else if (path === '/' || path.endsWith('.html')) {
          response.headers.set('Cache-Control', 'no-cache');
        }
        response.headers.set('X-Content-Type-Options', 'nosniff');
        return response;
      }
      return assetResponse;
    }

    return json(
      {
        error:
          'Not Found'
      },
      404
    );
  }
};
