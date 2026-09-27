const PRODUCTS_KEY = "products";
const LOGO_KEY = "logo";
const SETTINGS_KEY = "settings";
const ORDERS_KEY = "orders";
const SHIPPING_KEY = "shipping";
const DEALS_KEY = "deals";

const SEED_PRODUCTS = [];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
      "access-control-allow-headers": "Content-Type,Authorization"
    }
  });
}

function adminOk(request, env) {
  const auth = request.headers.get("authorization") || "";
  return !!env.ADMIN_PASSWORD && auth === "Bearer " + env.ADMIN_PASSWORD;
}

function normalizeProduct(p) {
  return {
    ...p,
    price: Number(p.price) || 0,
    oldPrice: Number(p.oldPrice) || 0,
    wholesalePrice: Number(p.wholesalePrice) || 0,
    shippingPrice: Number(p.shippingPrice) || 0,
    gift: String(p.gift || ""),
    details: String(p.details || ""),
    sticker: p.sticker && typeof p.sticker === "object" ? p.sticker : {},
    care: p.care && typeof p.care === "object" ? p.care : {},
    image: p.image || "/assets/logo.jpg"
  };
}

function normalizeDeal(d) {
  const items = Array.isArray(d.items)
    ? d.items.map(x => ({
        productId: x.productId,
        quantity: Math.max(1, Number(x.quantity) || 1)
      })).filter(x => x.productId != null)
    : [];
  const oldPrice = Number(d.oldPrice) || 0;
  const price = Number(d.price) || 0;
  return {
    ...d,
    id: String(d.id || ("DEAL-" + Date.now().toString(36).toUpperCase())),
    name: String(d.name || d.title || "صفقة Green Moon"),
    title: String(d.title || d.name || "صفقة Green Moon"),
    shortDescription: String(d.shortDescription || d.description || ""),
    description: String(d.description || ""),
    image: d.image || "/assets/logo.jpg",
    price,
    oldPrice,
    discount: Number(d.discount) || (oldPrice > price && oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0),
    contents: Array.isArray(d.contents) ? d.contents.map(String) : [],
    sizes: Array.isArray(d.sizes) ? d.sizes.map(String) : [],
    features: Array.isArray(d.features) ? d.features.map(String) : [],
    shipping: String(d.shipping || ""),
    notes: String(d.notes || ""),
    startAt: String(d.startAt || ""),
    endAt: String(d.endAt || d.expiresAt || ""),
    active: d.active !== false,
    items
  };
}

async function getProducts(env) {
  let data = await env.GREEN_MOON_KV.get(PRODUCTS_KEY, "json");
  if (!Array.isArray(data)) {
    data = SEED_PRODUCTS;
    await env.GREEN_MOON_KV.put(PRODUCTS_KEY, JSON.stringify(data));
  }
  return data.map(normalizeProduct);
}

async function getOrders(env) {
  return (await env.GREEN_MOON_KV.get(ORDERS_KEY, "json")) || [];
}

async function getDeals(env) {
  const data = await env.GREEN_MOON_KV.get(DEALS_KEY, "json");
  return Array.isArray(data) ? data.map(normalizeDeal) : [];
}

async function getShipping(env) {
  const data = await env.GREEN_MOON_KV.get(SHIPPING_KEY, "json");
  return Number(data && data.price) || 0;
}

function activeDeals(deals) {
  const now = Date.now();
  return deals.filter(d => {
    if (!d.active) return false;
    if (d.startAt && Number.isNaN(Date.parse(d.startAt))) return false;
    if (d.endAt && Number.isNaN(Date.parse(d.endAt))) return false;
    if (d.startAt && now < Date.parse(d.startAt)) return false;
    if (d.endAt && now >= Date.parse(d.endAt)) return false;
    return true;
  });
}

async function doctorAnalyze(request, env) {
  if (!env.AI) return json({ error: "Cloudflare Workers AI غير مربوط بالـ Worker." }, 500);
  const body = await request.json();
  const image = String(body.image || "");
  if (!image.startsWith("data:image/")) return json({ error: "الصورة غير صالحة." }, 400);
  if (image.length > 3500000) return json({ error: "الصورة كبيرة جدًا. جرّب صورة أصغر." }, 413);

  const products = await getProducts(env);
  const catalog = products.filter(p => p.price > 0).map(p => ({
    id: p.id, name: p.name, price: p.price, details: p.details
  }));

  const prompt =
    "أنت Green Moon Doctor لمتجر نباتات. حلل الصورة باللهجة المصرية البسيطة. " +
    "لا تؤكد تشخيصًا طبيًا أو زراعيًا من الصورة وحدها. إذا كانت الصورة غير كافية وضح ذلك. " +
    "إذا كان السؤال عن اختيار نبات، استخدم فقط الكتالوج التالي ولا تخترع منتجات أو أسعارًا: " +
    JSON.stringify(catalog);

  const result = await env.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", {
    prompt: prompt,
    image: image,
    max_tokens: 900,
    temperature: 0.3
  });

  const text = result && (result.response || result.result);
  if (!text) return json({ error: "Green Moon Doctor لم يُرجع نتيجة." }, 502);
  return json({ success: true, result: String(text), products: catalog });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response("", { status: 204, headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
      "access-control-allow-headers": "Content-Type,Authorization"
    }});

    try {
      if (url.pathname === "/api/products" && request.method === "GET") {
        const products = await getProducts(env);
        return json(products.map(({ wholesalePrice, ...p }) => p));
      }

      if (url.pathname === "/api/deals" && request.method === "GET") {
        return json(activeDeals(await getDeals(env)));
      }

      if (url.pathname === "/api/settings" && request.method === "GET") {
        return json(await env.GREEN_MOON_KV.get(SETTINGS_KEY, "json") || {
          storeName: "Green Moon Plants and Flowers",
          title: "Green Moon",
          subtitle: "اختار نباتتك وخلي بيتك أحلى",
          whatsapp: ""
        });
      }

      if (url.pathname === "/api/logo" && request.method === "GET") {
        return json({ logo: await env.GREEN_MOON_KV.get(LOGO_KEY) || "/assets/logo.jpg" });
      }

      if (url.pathname === "/api/shipping" && request.method === "GET") {
        return json({ shipping: await getShipping(env) });
      }

      if (url.pathname === "/api/doctor/analyze" && request.method === "POST") {
        return await doctorAnalyze(request, env);
      }

      if (url.pathname === "/api/orders" && request.method === "POST") {
        const body = await request.json();
        if (!body.name || !body.phone || !Array.isArray(body.items) || !body.items.length) {
          return json({ error: "بيانات الطلب غير مكتملة" }, 400);
        }

        const products = await getProducts(env);
        const items = body.items.map(input => {
          const p = products.find(x => String(x.id) === String(input.productId));
          if (!p) return null;
          const quantity = Math.max(1, Number(input.quantity) || 1);
          return {
            productId: p.id,
            name: p.name,
            price: p.price,
            oldPrice: p.oldPrice,
            gift: p.gift,
            image: p.image,
            quantity,
            shippingPrice: p.shippingPrice,
            lineTotal: p.price * quantity
          };
        }).filter(Boolean);

        if (!items.length) return json({ error: "المنتجات المطلوبة غير موجودة" }, 400);

        const productsTotal = items.reduce((a, x) => a + x.lineTotal, 0);
        const discount = items.reduce((a, x) => a + Math.max(0, x.oldPrice - x.price) * x.quantity, 0);
        const gifts = [...new Set(items.map(x => x.gift).filter(Boolean))].map(name => ({ name, quantity: 1, price: 0, lineTotal: 0 }));

        const generalShipping = await getShipping(env);
        const shipping = Math.max(
          generalShipping,
          ...items.map(x => Number(x.shippingPrice) || 0)
        );
        const total = productsTotal + shipping;

        const order = {
          id: "GM-" + Date.now().toString(36).toUpperCase(),
          createdAt: new Date().toISOString(),
          status: "جديد",
          name: String(body.name).slice(0, 120),
          phone: String(body.phone).slice(0, 40),
          governorate: String(body.governorate || "").slice(0, 80),
          area: String(body.area || "").slice(0, 120),
          street: String(body.street || "").slice(0, 160),
          building: String(body.building || "").slice(0, 40),
          floor: String(body.floor || "").slice(0, 20),
          apartment: String(body.apartment || "").slice(0, 20),
          notes: String(body.notes || "").slice(0, 500),
          productsTotal,
          discount,
          shipping,
          gifts,
          items,
          total
        };

        const orders = await getOrders(env);
        orders.unshift(order);
        await env.GREEN_MOON_KV.put(ORDERS_KEY, JSON.stringify(orders.slice(0, 500)));
        return json({ success: true, order });
      }

      if (url.pathname === "/api/admin/products") {
        if (!adminOk(request, env)) return json({ error: "غير مصرح" }, 401);
        if (request.method === "GET") return json(await getProducts(env));

        const products = await getProducts(env);
        if (request.method === "POST") {
          const body = await request.json();
          const product = normalizeProduct({ ...body, id: body.id || Date.now() });
          products.push(product);
          await env.GREEN_MOON_KV.put(PRODUCTS_KEY, JSON.stringify(products));
          return json({ success: true, products });
        }

        if (request.method === "PUT") {
          const body = await request.json();
          const index = products.findIndex(p => String(p.id) === String(body.id));
          if (index < 0) return json({ error: "المنتج غير موجود" }, 404);
          products[index] = normalizeProduct({ ...products[index], ...body });
          await env.GREEN_MOON_KV.put(PRODUCTS_KEY, JSON.stringify(products));
          return json({ success: true, products });
        }

        if (request.method === "DELETE") {
          const body = await request.json();
          const filtered = products.filter(p => String(p.id) !== String(body.id));
          await env.GREEN_MOON_KV.put(PRODUCTS_KEY, JSON.stringify(filtered));
          return json({ success: true, products: filtered });
        }
      }

      if (url.pathname === "/api/admin/deals") {
        if (!adminOk(request, env)) return json({ error: "غير مصرح" }, 401);
        let deals = await getDeals(env);
        if (request.method === "GET") return json(deals);

        const body = await request.json();
        if (request.method === "POST") deals.push(normalizeDeal(body));
        else if (request.method === "PUT") {
          const i = deals.findIndex(d => String(d.id) === String(body.id));
          if (i < 0) return json({ error: "الصفقة غير موجودة" }, 404);
          deals[i] = normalizeDeal({ ...deals[i], ...body });
        } else if (request.method === "DELETE") {
          deals = deals.filter(d => String(d.id) !== String(body.id));
        } else return json({ error: "Method Not Allowed" }, 405);

        await env.GREEN_MOON_KV.put(DEALS_KEY, JSON.stringify(deals));
        return json({ success: true, deals });
      }

      if (url.pathname === "/api/admin/settings") {
        if (!adminOk(request, env)) return json({ error: "غير مصرح" }, 401);
        if (request.method === "GET") return json(await env.GREEN_MOON_KV.get(SETTINGS_KEY, "json") || {});
        const body = await request.json();
        await env.GREEN_MOON_KV.put(SETTINGS_KEY, JSON.stringify(body));
        return json({ success: true, settings: body });
      }

      if (url.pathname === "/api/admin/logo") {
        if (!adminOk(request, env)) return json({ error: "غير مصرح" }, 401);
        if (request.method === "GET") return json({ logo: await env.GREEN_MOON_KV.get(LOGO_KEY) || "/assets/logo.jpg" });
        const body = await request.json();
        const logo = String(body.logo || "");
        await env.GREEN_MOON_KV.put(LOGO_KEY, logo);
        return json({ success: true, logo });
      }

      if (url.pathname === "/api/admin/shipping") {
        if (!adminOk(request, env)) return json({ error: "غير مصرح" }, 401);
        if (request.method === "GET") return json({ price: await getShipping(env) });
        const body = await request.json();
        const price = Number(body.price ?? body.shipping ?? 0) || 0;
        await env.GREEN_MOON_KV.put(SHIPPING_KEY, JSON.stringify({ price }));
        return json({ success: true, price });
      }

      if (url.pathname === "/api/admin/orders") {
        if (!adminOk(request, env)) return json({ error: "غير مصرح" }, 401);
        if (request.method === "GET") return json(await getOrders(env));
        const body = await request.json();
        const orders = await getOrders(env);
        const i = orders.findIndex(o => String(o.id) === String(body.id));
        if (i < 0) return json({ error: "الطلب غير موجود" }, 404);
        orders[i] = { ...orders[i], ...body };
        await env.GREEN_MOON_KV.put(ORDERS_KEY, JSON.stringify(orders));
        return json({ success: true, order: orders[i] });
      }

      if (env.ASSETS) return env.ASSETS.fetch(request);
      return json({ error: "Not Found" }, 404);
    } catch (error) {
      return json({ error: String(error && (error.message || error) || "حدث خطأ") }, 500);
    }
  }
};
