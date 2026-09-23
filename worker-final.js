const PRODUCTS_KEY = 'products';
const LOGO_KEY = 'logo';
const SETTINGS_KEY = 'settings';
const ORDERS_KEY = 'orders';
const SHIPPING_KEY = 'shipping';
const DOCTOR_AGREEMENT_KEY = 'GM_DOCTOR_META_AGREED';

const SEED_PRODUCTS = [
  {id:1,name:'أجلونيما بينك',details:'نبات أجلونيما بألوان وردي وأخضر مميزة، مناسب للديكور الداخلي.',price:0,wholesalePrice:0,shippingPrice:0,care:{},image:'/assets/product-1.jpg'},
  {id:2,name:'أجلونيما بينك سبوت',details:'أوراق وردية كثيفة بتوزيعات خضراء جميلة.',price:0,wholesalePrice:0,shippingPrice:0,care:{},image:'/assets/product-2.jpg'},
  {id:3,name:'أجلونيما بينك جرين',details:'أجلونيما بأوراق وردية زاهية وتفاصيل خضراء.',price:0,wholesalePrice:0,shippingPrice:0,care:{},image:'/assets/product-3.jpg'},
  {id:4,name:'تشكيلة أجلونيما',details:'مجموعة من نباتات أجلونيما بألوان ونقوش مختلفة.',price:0,wholesalePrice:0,shippingPrice:0,care:{},image:'/assets/product-4.jpg'},
  {id:5,name:'أجلونيما بينك فين',details:'أوراق خضراء بنقوش وردية وعروق وردية واضحة.',price:0,wholesalePrice:0,shippingPrice:0,care:{},image:'/assets/product-5.jpg'},
  {id:6,name:'أجلونيما وايت',details:'أجلونيما بأوراق خضراء وبيضاء، مناسبة للمكاتب والبيوت.',price:0,wholesalePrice:0,shippingPrice:0,care:{},image:'/assets/product-6.jpg'},
  {id:7,name:'بوتس مبرقش',details:'بوتس أخضر بتبرقش فاتح، نبات سهل العناية وسريع النمو.',price:0,wholesalePrice:0,shippingPrice:0,care:{},image:'/assets/product-7.jpg'},
  {id:8,name:'أنثوريوم أبيض',details:'أنثوريوم بأزهار بيضاء وأوراق خضراء أنيقة.',price:0,wholesalePrice:0,shippingPrice:0,care:{},image:'/assets/product-8.jpg'}
];

function json(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=UTF-8','cache-control':'no-store','access-control-allow-origin':'*'}});
}
function adminOk(request,env){
  const auth=request.headers.get('authorization')||'';
  return !!env.ADMIN_PASSWORD && auth===`Bearer ${env.ADMIN_PASSWORD}`;
}
function normalizeProduct(p){
  return {...p,price:Number(p.price)||0,wholesalePrice:Number(p.wholesalePrice)||0,shippingPrice:Number(p.shippingPrice)||0,care:p.care&&typeof p.care==='object'?p.care:{},image:p.image||'/assets/logo.jpg'};
}
async function getProducts(env){
  try{
    const raw=await env.GREEN_MOON_KV.get(PRODUCTS_KEY);
    if(!raw){const products=SEED_PRODUCTS.map(normalizeProduct);await env.GREEN_MOON_KV.put(PRODUCTS_KEY,JSON.stringify(products));return products;}
    let products;
    try{products=JSON.parse(raw);}catch{const repaired=SEED_PRODUCTS.map(normalizeProduct);await env.GREEN_MOON_KV.put(PRODUCTS_KEY,JSON.stringify(repaired));return repaired;}
    if(!Array.isArray(products)){const repaired=SEED_PRODUCTS.map(normalizeProduct);await env.GREEN_MOON_KV.put(PRODUCTS_KEY,JSON.stringify(repaired));return repaired;}
    return products.map(normalizeProduct);
  }catch(error){console.error('GREEN_MOON_PRODUCTS_KV_ERROR',error);throw new Error(`GREEN_MOON_KV / products: ${error?.message||String(error)}`);}
}
async function getLogo(env){return await env.GREEN_MOON_KV.get(LOGO_KEY)||'/assets/logo.jpg';}
async function getShipping(env){const value=await env.GREEN_MOON_KV.get(SHIPPING_KEY,'json');return Number(value?.price)||0;}
async function getOrders(env){return await env.GREEN_MOON_KV.get(ORDERS_KEY,'json')||[];}
async function getSettings(env){return await env.GREEN_MOON_KV.get(SETTINGS_KEY,'json')||{};}

async function sendWhatsAppTemplate(env,to,templateName,parameters=[]){
  const token=env.WHATSAPP_TOKEN,phoneNumberId=env.WHATSAPP_PHONE_NUMBER_ID;
  if(!token||!phoneNumberId||!to||!templateName)return false;
  const version=env.WHATSAPP_GRAPH_VERSION||'v23.0';
  const payload={messaging_product:'whatsapp',to:String(to).replace(/[^0-9]/g,''),type:'template',template:{name:templateName,language:{code:env.WHATSAPP_TEMPLATE_LANG||'ar'},components:parameters.length?[{type:'body',parameters:parameters.map(v=>({type:'text',text:String(v??'')}))}]:[]}};
  try{const r=await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:JSON.stringify(payload)});return r.ok;}catch{return false;}
}
async function notifyNewOrderWhatsApp(env,order){return sendWhatsAppTemplate(env,env.WHATSAPP_ADMIN_PHONE,env.WHATSAPP_NEW_ORDER_TEMPLATE,[order.id,order.name,order.total,order.phone]);}
async function notifyOrderStatusWhatsApp(env,order){return sendWhatsAppTemplate(env,env.WHATSAPP_ADMIN_PHONE,env.WHATSAPP_STATUS_TEMPLATE,[order.id,order.name,order.status]);}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(request.method==='OPTIONS')return new Response('',{status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS','access-control-allow-headers':'Content-Type,Authorization'}});

    if(url.pathname==='/api/products'&&request.method==='GET'){
      const products=await getProducts(env);return json(products.map(({wholesalePrice,...p})=>p));
    }
    if(url.pathname==='/api/logo'&&request.method==='GET')return json({logo:await getLogo(env)});
    if(url.pathname==='/api/settings'&&request.method==='GET'){
      const settings=await getSettings(env);return json(Object.keys(settings).length?settings:{storeName:'Green Moon Plants and Flowers',title:'Green Moon 🌿',subtitle:'اختار نباتتك وخلي بيتك أحلى 💚',whatsapp:''});
    }
    if(url.pathname==='/api/shipping'&&request.method==='GET')return json({shipping:await getShipping(env)});

    if(url.pathname==='/api/orders'&&request.method==='POST'){
      try{
        const body=await request.json();
        if(!body.name||!body.phone||!Array.isArray(body.items)||!body.items.length)return json({error:'بيانات الطلب غير مكتملة'},400);
        const products=await getProducts(env);
        const items=body.items.map(item=>{
          const product=products.find(p=>String(p.id)===String(item.productId));if(!product)return null;
          const quantity=Math.max(1,Number(item.quantity)||1);const price=Number(product.price)||0;
          return {productId:product.id,name:product.name,price,quantity,shippingPrice:Number(product.shippingPrice)||0,lineTotal:price*quantity};
        }).filter(Boolean);
        if(!items.length)return json({error:'المنتجات المطلوبة غير موجودة'},400);
        const productsTotal=items.reduce((s,i)=>s+i.lineTotal,0);
        const ids=[...new Set(items.map(i=>String(i.productId)))];
        let shipping=await getShipping(env);
        if(ids.length===1){const p=products.find(x=>String(x.id)===ids[0]);shipping=Number(p?.shippingPrice)||0;}
        const order={id:'GM-'+Date.now().toString(36).toUpperCase(),createdAt:new Date().toISOString(),status:'جديد',name:String(body.name).slice(0,120),phone:String(body.phone).slice(0,40),governorate:String(body.governorate||'').slice(0,80),area:String(body.area||'').slice(0,120),street:String(body.street||'').slice(0,160),building:String(body.building||'').slice(0,40),floor:String(body.floor||'').slice(0,20),apartment:String(body.apartment||'').slice(0,20),notes:String(body.notes||'').slice(0,500),productsTotal,shipping,items,total:productsTotal+shipping};
        const orders=await getOrders(env);orders.unshift(order);await env.GREEN_MOON_KV.put(ORDERS_KEY,JSON.stringify(orders.slice(0,500)));
        await notifyNewOrderWhatsApp(env,order);
        return json({success:true,order});
      }catch(error){return json({error:'حدث خطأ أثناء حفظ الطلب',details:String(error?.message||error)},500);}
    }

    if(url.pathname==='/api/doctor/analyze'&&request.method==='POST'){
      try{
        if(!env.AI)return json({error:'Cloudflare Workers AI غير مربوط بالـ Worker.'},500);
        const body=await request.json();const image=String(body.image||'');
        if(!image.startsWith('data:image/'))return json({error:'الصورة غير صالحة.'},400);
        if(image.length>8000000)return json({error:'حجم الصورة كبير جدًا. اختار صورة أصغر.'},413);
        const products=await getProducts(env);const productCatalog=products.filter(p=>Number(p.price)>0).map(p=>({id:p.id,name:p.name,price:Number(p.price)||0,details:p.details||'',image:p.image||'/assets/logo.jpg'}));
        if(!(await env.GREEN_MOON_KV.get(DOCTOR_AGREEMENT_KEY))){await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct',{prompt:'agree'});await env.GREEN_MOON_KV.put(DOCTOR_AGREEMENT_KEY,'1');}
        const prompt=`أنت Green Moon Doctor 🌿، مساعد اختيار النباتات لمتجر Green Moon Plants & Flowers. حلل الصورة المرفقة. استخدم فقط منتجات الكتالوج أدناه، لا تخترع منتجات أو أسعارًا، واذكر من 1 إلى 3 اختيارات مناسبة باللهجة المصرية. كتالوج Green Moon: ${JSON.stringify(productCatalog)}`;
        const ai=await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct',{messages:[{role:'system',content:'أنت Green Moon Doctor، مساعد متخصص في تحليل صور النباتات والأماكن واقتراح نباتات Green Moon.'},{role:'user',content:prompt}],image,max_tokens:900,temperature:0.3});
        const result=ai?.response||ai?.result||'';if(!String(result).trim())return json({error:'Green Moon Doctor لم يُرجع نتيجة.'},502);
        return json({success:true,result:String(result).trim(),products:productCatalog});
      }catch(error){return json({error:error?.message||JSON.stringify(error)||String(error)||'حدث خطأ أثناء تحليل الصورة.'},500);}
    }

    if(url.pathname==='/api/admin/products'){
      if(!adminOk(request,env))return json({error:'غير مصرح'},401);
      try{
        if(request.method==='GET')return json(await getProducts(env));
        if(request.method==='POST'||request.method==='PUT'){
          const body=await request.json();let products=await getProducts(env);
          if(request.method==='POST'&&!body.id){products.push(normalizeProduct({...body,id:Date.now()}));}
          else{const i=products.findIndex(p=>String(p.id)===String(body.id));if(i<0)return json({error:'المنتج غير موجود'},404);products[i]=normalizeProduct({...products[i],...body,id:products[i].id});}
          await env.GREEN_MOON_KV.put(PRODUCTS_KEY,JSON.stringify(products));return json({success:true,products});
        }
        if(request.method==='DELETE'){
          const body=await request.json();const products=(await getProducts(env)).filter(p=>String(p.id)!==String(body.id));await env.GREEN_MOON_KV.put(PRODUCTS_KEY,JSON.stringify(products));return json({success:true,products});
        }
        return json({error:'Method Not Allowed'},405);
      }catch(error){console.error('ADMIN_PRODUCTS_ERROR',error);return json({error:'فشل تحميل/حفظ المنتجات.',details:error?.message||String(error)},500);}
    }

    if(url.pathname==='/api/admin/logo'){
      if(!adminOk(request,env))return json({error:'غير مصرح'},401);
      try{
        if(request.method==='GET')return json({logo:await getLogo(env)});
        if(request.method==='POST'||request.method==='PUT'){const body=await request.json();const logo=String(body.logo||'');await env.GREEN_MOON_KV.put(LOGO_KEY,logo);return json({success:true,logo});}
        return json({error:'Method Not Allowed'},405);
      }catch(e){return json({error:e?.message||String(e)},500);}
    }

    if(url.pathname==='/api/admin/settings'){
      if(!adminOk(request,env))return json({error:'غير مصرح'},401);
      try{
        if(request.method==='GET')return json(await getSettings(env));
        if(request.method==='POST'||request.method==='PUT'){const body=await request.json();await env.GREEN_MOON_KV.put(SETTINGS_KEY,JSON.stringify(body));if(body.logo)await env.GREEN_MOON_KV.put(LOGO_KEY,String(body.logo));return json({success:true,settings:body});}
        return json({error:'Method Not Allowed'},405);
      }catch(e){return json({error:e?.message||String(e)},500);}
    }

    if(url.pathname==='/api/admin/shipping'){
      if(!adminOk(request,env))return json({error:'غير مصرح'},401);
      try{
        if(request.method==='GET')return json({price:await getShipping(env)});
        if(request.method==='POST'||request.method==='PUT'){const body=await request.json();const price=Number(body.price??body.shipping??0)||0;await env.GREEN_MOON_KV.put(SHIPPING_KEY,JSON.stringify({price}));return json({success:true,price});}
        return json({error:'Method Not Allowed'},405);
      }catch(e){return json({error:e?.message||String(e)},500);}
    }

    if(url.pathname==='/api/admin/orders'){
      if(!adminOk(request,env))return json({error:'غير مصرح'},401);
      try{
        if(request.method==='GET')return json(await getOrders(env));
        if(request.method==='PUT'||request.method==='POST'){
          const body=await request.json();const orders=await getOrders(env);const i=orders.findIndex(o=>String(o.id)===String(body.id));if(i<0)return json({error:'الطلب غير موجود'},404);
          const previousStatus=String(orders[i].status||'');orders[i]={...orders[i],...body};await env.GREEN_MOON_KV.put(ORDERS_KEY,JSON.stringify(orders));
          if(String(orders[i].status||'')!==previousStatus)await notifyOrderStatusWhatsApp(env,orders[i]);
          return json({success:true,order:orders[i]});
        }
        return json({error:'Method Not Allowed'},405);
      }catch(e){return json({error:e?.message||String(e)},500);}
    }

    if(url.pathname==='/api/admin/reset'&&request.method==='POST'){
      if(!adminOk(request,env))return json({error:'غير مصرح'},401);const products=SEED_PRODUCTS.map(normalizeProduct);await env.GREEN_MOON_KV.put(PRODUCTS_KEY,JSON.stringify(products));return json({success:true,products});
    }

    if(env.ASSETS)return env.ASSETS.fetch(request);
    return json({error:'Not Found'},404);
  }
};
