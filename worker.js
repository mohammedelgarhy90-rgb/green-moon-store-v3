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
  let products =
    await env.GREEN_MOON_KV.get(
      PRODUCTS_KEY,
      'json'
    );

  if (!Array.isArray(products)) {
    products =
      SEED_PRODUCTS.map(
        normalizeProduct
      );

    await env.GREEN_MOON_KV.put(
      PRODUCTS_KEY,
      JSON.stringify(products)
    );
  }

  return products.map(
    normalizeProduct
  );
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
       GREEN MOON DOCTOR
    ========================= */

    if (
      url.pathname === '/api/doctor/analyze' &&
      request.method === 'POST'
    ) {

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
              )
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
