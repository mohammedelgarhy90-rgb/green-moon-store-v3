const PRODUCTS_KEY = 'products';
const LOGO_KEY = 'logo';
const SETTINGS_KEY = 'settings';
const ORDERS_KEY = 'orders';
const SHIPPING_KEY = 'shipping';

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

async function getProducts(env) {
  try {
    const raw = await env.GREEN_MOON_KV.get(PRODUCTS_KEY);

    if (!raw) {
      const products = SEED_PRODUCTS.map(normalizeProduct);

      await env.GREEN_MOON_KV.put(
        PRODUCTS_KEY,
        JSON.stringify(products)
      );

      return products;
    }

    let products;

    try {
      products = JSON.parse(raw);
    } catch (parseError) {
      console.error('GREEN_MOON_PRODUCTS_JSON_ERROR', parseError);

      const repaired = SEED_PRODUCTS.map(normalizeProduct);

      await env.GREEN_MOON_KV.put(
        PRODUCTS_KEY,
        JSON.stringify(repaired)
      );

      return repaired;
    }

    if (!Array.isArray(products)) {
      const repaired = SEED_PRODUCTS.map(normalizeProduct);

      await env.GREEN_MOON_KV.put(
        PRODUCTS_KEY,
        JSON.stringify(repaired)
      );

      return repaired;
    }

    return products.map(normalizeProduct);
  } catch (error) {
    console.error('GREEN_MOON_PRODUCTS_KV_ERROR', error);

    throw new Error(
      `GREEN_MOON_KV / products: ${error?.message || String(error)}`
    );
  }
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
}async function sendWhatsAppTemplate(env, to, templateName, parameters = []) {
  const token = env.WHATSAPP_TOKEN;
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId || !to || !templateName) {
    return false;
  }

  const version = env.WHATSAPP_GRAPH_VERSION || 'v23.0';

  const url =
    `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: String(to).replace(/[^0-9]/g, ''),
    type: 'template',

    template: {
      name: templateName,

      language: {
        code: env.WHATSAPP_TEMPLATE_LANG || 'ar'
      },

      components: parameters.length
        ? [{
            type: 'body',

            parameters: parameters.map(value => ({
              type: 'text',
              text: String(value ?? '')
            }))
          }]
        : []
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',

      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`
      },

      body: JSON.stringify(payload)
    });

    return response.ok;

  } catch {
    return false;
  }
}


async function notifyNewOrderWhatsApp(env, order) {
  return sendWhatsAppTemplate(
    env,
    env.WHATSAPP_ADMIN_PHONE,
    env.WHATSAPP_NEW_ORDER_TEMPLATE,

    [
      order.id,
      order.name,
      order.total,
      order.phone
    ]
  );
}


async function notifyOrderStatusWhatsApp(env, order) {
  return sendWhatsAppTemplate(
    env,
    env.WHATSAPP_ADMIN_PHONE,
    env.WHATSAPP_STATUS_TEMPLATE,

    [
      order.id,
      order.name,
      order.status
    ]
  );
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

      const settings =
        await env.GREEN_MOON_KV.get(
          SETTINGS_KEY,
          'json'
        );

      return json(
        settings || {
          storeName:
            'Green Moon Plants and Flowers',

          title:
            'Green Moon 🌿',

          subtitle:
            'اختار نباتتك وخلي بيتك أحلى 💚',

          whatsapp: ''
        }
      );
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

              return {
                productId:
                  product.id,

                name:
                  product.name,

                price:
                  Number(product.price) || 0,

                quantity,

                shippingPrice:
                  Number(
                    product.shippingPrice
                  ) || 0,

                lineTotal:
                  (
                    Number(product.price) || 0
                  ) * quantity
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

        const total =
          productsTotal + shipping;

        const orders =
          await getOrders(env);

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
        await notifyNewOrderWhatsApp(env, order);
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

        try {
          const products = await getProducts(env);
          return json(products);
        } catch (error) {
          console.error('ADMIN_PRODUCTS_GET_ERROR', error);

          return json(
            {
              error: 'فشل تحميل المنتجات من قاعدة البيانات.',
              details:
                error?.message ||
                String(error)
            },
            500
          );
        }
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
const previousStatus = String(orders[index].status || '');
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

          if (String(orders[index].status || '') !== previousStatus) {
            await notifyOrderStatusWhatsApp(env, orders[index]);
          }

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
