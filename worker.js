const PRODUCTS_KEY = 'products';
const LOGO_KEY = 'logo';
const SETTINGS_KEY = 'settings';
const ORDERS_KEY = 'orders';
const SHIPPING_KEY = 'shipping';

const SEED_PRODUCTS = [
  {
    id:1,
    name:'أجلونيما بينك',
    details:'نبات أجلونيما بألوان وردي وأخضر مميزة، مناسب للديكور الداخلي.',
    price:0,
    wholesalePrice:0,
    shippingPrice:0,
    care:{},
    image:'/assets/product-1.jpg'
  },
  {
    id:2,
    name:'أجلونيما بينك سبوت',
    details:'أوراق وردية كثيفة بتوزيعات خضراء جميلة.',
    price:0,
    wholesalePrice:0,
    shippingPrice:0,
    care:{},
    image:'/assets/product-2.jpg'
  },
  {
    id:3,
    name:'أجلونيما بينك جرين',
    details:'أجلونيما بأوراق وردية زاهية وتفاصيل خضراء.',
    price:0,
    wholesalePrice:0,
    shippingPrice:0,
    care:{},
    image:'/assets/product-3.jpg'
  },
  {
    id:4,
    name:'تشكيلة أجلونيما',
    details:'مجموعة من نباتات أجلونيما بألوان ونقوش مختلفة.',
    price:0,
    wholesalePrice:0,
    shippingPrice:0,
    care:{},
    image:'/assets/product-4.jpg'
  },
  {
    id:5,
    name:'أجلونيما بينك فين',
    details:'أوراق خضراء بنقوش وردية وعروق وردية واضحة.',
    price:0,
    wholesalePrice:0,
    shippingPrice:0,
    care:{},
    image:'/assets/product-5.jpg'
  },
  {
    id:6,
    name:'أجلونيما وايت',
    details:'أجلونيما بأوراق خضراء وبيضاء، مناسبة للمكاتب والبيوت.',
    price:0,
    wholesalePrice:0,
    shippingPrice:0,
    care:{},
    image:'/assets/product-6.jpg'
  },
  {
    id:7,
    name:'بوتس مبرقش',
    details:'بوتس أخضر بتبرقش فاتح، نبات سهل العناية وسريع النمو.',
    price:0,
    wholesalePrice:0,
    shippingPrice:0,
    care:{},
    image:'/assets/product-7.jpg'
  },
  {
    id:8,
    name:'أنثوريوم أبيض',
    details:'أنثوريوم بأزهار بيضاء وأوراق خضراء أنيقة.',
    price:0,
    wholesalePrice:0,
    shippingPrice:0,
    care:{},
    image:'/assets/product-8.jpg'
  }
];

function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{
      'content-type':'application/json;charset=UTF-8',
      'cache-control':'no-store',
      'access-control-allow-origin':'*'
    }
  });
}

function adminOk(request,env){
  const h=request.headers.get('authorization')||'';
  return h===`Bearer ${env.ADMIN_PASSWORD}` && !!env.ADMIN_PASSWORD;
}

function normalizeProduct(p){
  return {
    ...p,
    shippingPrice:Number(p.shippingPrice)||0,
    care:p.care && typeof p.care==='object'
      ? p.care
      : {}
  };
}

async function getProducts(env){
  let x=await env.GREEN_MOON_KV.get(PRODUCTS_KEY,'json');

  if(!x){
    x=SEED_PRODUCTS.map(normalizeProduct);

    await env.GREEN_MOON_KV.put(
      PRODUCTS_KEY,
      JSON.stringify(x)
    );
  }

  return x.map(normalizeProduct);
}

async function getLogo(env){
  return (
    await env.GREEN_MOON_KV.get(LOGO_KEY)
  ) || '/assets/logo.jpg';
}

async function getShipping(env){
  const x=
    await env.GREEN_MOON_KV.get(
      SHIPPING_KEY,
      'json'
    );

  return Number(x?.price)||0;
}

async function getOrders(env){
  return (
    await env.GREEN_MOON_KV.get(
      ORDERS_KEY,
      'json'
    )
  ) || [];
}

export default {

  async fetch(request,env){

    const url=new URL(request.url);

    if(request.method==='OPTIONS'){
      return new Response('',{
        status:204,
        headers:{
          'access-control-allow-origin':'*',
          'access-control-allow-methods':
            'GET,POST,PUT,DELETE,OPTIONS',
          'access-control-allow-headers':
            'Content-Type,Authorization'
        }
      });
    }

    /*
     * المنتجات للعميل
     * سعر الجملة لا يتم إرساله للعميل
     */
    if(
      url.pathname==='/api/products' &&
      request.method==='GET'
    ){

      const products=
        await getProducts(env);

      return json(
        products.map(
          ({wholesalePrice,...p})=>p
        )
      );
    }

    /*
     * اللوجو
     */
    if(
      url.pathname==='/api/logo' &&
      request.method==='GET'
    ){
      return json({
        logo:await getLogo(env)
      });
    }

    /*
     * إعدادات الموقع
     */
    if(
      url.pathname==='/api/settings' &&
      request.method==='GET'
    ){

      return json(
        await env.GREEN_MOON_KV.get(
          SETTINGS_KEY,
          'json'
        ) || {
          storeName:
            'Green Moon Plants and Flowers',
          whatsapp:''
        }
      );
    }

    /*
     * سعر التوصيل العام
     */
    if(
      url.pathname==='/api/shipping' &&
      request.method==='GET'
    ){

      return json({
        shipping:
          await getShipping(env)
      });
    }

    /*
     * إنشاء طلب
     */
    if(
      url.pathname==='/api/orders' &&
      request.method==='POST'
    ){

      try{

        const body=
          await request.json();

        if(
          !body.name ||
          !body.phone ||
          !Array.isArray(body.items) ||
          !body.items.length
        ){
          return json(
            {
              error:
                'بيانات الطلب غير مكتملة'
            },
            400
          );
        }

        const products=
          await getProducts(env);

        const items=
          body.items
          .map(i=>{

            const p=
              products.find(
                x =>
                  String(x.id) ===
                  String(i.productId)
              );

            const qty=
              Math.max(
                1,
                Number(i.quantity)||1
              );

            if(!p){
              return null;
            }

            return {
              productId:p.id,
              name:p.name,
              price:Number(p.price)||0,
              quantity:qty,
              shippingPrice:
                Number(p.shippingPrice)||0,
              lineTotal:
                (Number(p.price)||0)*qty
            };

          })
          .filter(Boolean);

        if(!items.length){
          return json(
            {
              error:
                'المنتجات المطلوبة غير موجودة'
            },
            400
          );
        }

        const productsTotal=
          items.reduce(
            (s,i)=>s+i.lineTotal,
            0
          );

        /*
         * نظام التوصيل:
         *
         * منتج واحد فقط:
         * نستخدم سعر توصيل هذا المنتج.
         *
         * أكثر من منتج:
         * نستخدم سعر التوصيل العام.
         */

        const generalShipping=
          await getShipping(env);

        const uniqueProductIds=
          [
            ...new Set(
              items.map(
                i=>String(i.productId)
              )
            )
          ];

        let shipping=0;

        if(uniqueProductIds.length===1){

          const product=
            products.find(
              p =>
                String(p.id) ===
                uniqueProductIds[0]
            );

          shipping=
            Number(
              product?.shippingPrice
            ) || 0;

        }else{

          shipping=
            generalShipping;

        }

        const total=
          productsTotal+shipping;

        const orders=
          await getOrders(env);

        const order={

          id:
            'GM-' +
            Date.now()
            .toString(36)
            .toUpperCase(),

          createdAt:
            new Date().toISOString(),

          status:'جديد',

          name:
            String(body.name)
            .slice(0,120),

          phone:
            String(body.phone)
            .slice(0,40),

          governorate:
            String(body.governorate||'')
            .slice(0,80),

          area:
            String(body.area||'')
            .slice(0,120),

          street:
            String(body.street||'')
            .slice(0,160),

          building:
            String(body.building||'')
            .slice(0,40),

          floor:
            String(body.floor||'')
            .slice(0,20),

          apartment:
            String(body.apartment||'')
            .slice(0,20),

          notes:
            String(body.notes||'')
            .slice(0,500),

          productsTotal,

          shipping,

          items,

          total
        };

        orders
