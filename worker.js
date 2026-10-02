const PRODUCTS_KEY = 'products';
const LOGO_KEY = 'logo';
const SETTINGS_KEY = 'settings';
const ORDERS_KEY = 'orders';
const SHIPPING_KEY = 'shipping';
const DEALS_KEY = 'deals';

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
    products = products.map(normalizeProduct);
    // Keep a last-known-good snapshot so a bad/empty KV write cannot blank the shop.
    try { await env.GREEN_MOON_KV.put(PRODUCTS_BACKUP_KEY, JSON.stringify(products)); } catch (_) {}
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

export default {

  async fetch(request, env) {

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
       PUBLIC PRODUCTS
    ========================= */

    if (
      url.pathname === '/api/products' &&
      request.method === 'GET'
    ) {

      const products =
        await getProducts(env);

      return json(
        products.map(
          ({
            wholesalePrice,
            ...product
          }) => product
        )
      );
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
      try { await env.GREEN_MOON_KV.put(SETTINGS_BACKUP_KEY, JSON.stringify(settings)); } catch (_) {}
      return json(settings);
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

        const order = {

          id:
            'GM-' +
            Date.now()
              .toString(36)
              .toUpperCase(),

          createdAt:
            new Date().toISOString(),

          status:
            'جديد',

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

          total
        };

        orders.unshift(order);

        await env.GREEN_MOON_KV.put(
          ORDERS_KEY,
          JSON.stringify(
            orders.slice(0, 500)
          )
        );

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

          await env.GREEN_MOON_KV.put(
            PRODUCTS_KEY,
            JSON.stringify(
              products
            )
          );

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

          await env.GREEN_MOON_KV.put(
            PRODUCTS_KEY,
            JSON.stringify(
              filtered
            )
          );

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

          orders[index] = {
            ...orders[index],
            ...body
          };

          await env.GREEN_MOON_KV.put(
            ORDERS_KEY,
            JSON.stringify(
              orders
            )
          );

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

      await env.GREEN_MOON_KV.put(
        PRODUCTS_KEY,
        JSON.stringify(
          products
        )
      );

      return json({
        success:
          true,

        products
      });
    }

    /* =========================
       STATIC FILES
    ========================= */

    if (env.ASSETS) {
      return env.ASSETS.fetch(
        request
      );
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
