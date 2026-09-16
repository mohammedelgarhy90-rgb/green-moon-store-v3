const CORS={
  "access-control-allow-origin":"*",
  "access-control-allow-methods":"GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers":"Content-Type,Authorization"
};
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store",...CORS,...extra}});
const ok=(data={})=>json({success:true,...data});
const fail=(code,message,status=400,details=null)=>json({success:false,error:{code,message,details}},status);
const text=v=>String(v??"").trim();
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const int=(v,d=0)=>Number.isFinite(Number(v))?Math.trunc(Number(v)):d;
const bool=v=>v===true||v===1||v==="1"||v==="true";
const slugify=s=>text(s).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\u0600-\u06ff]+/g,"-").replace(/^-+|-+$/g,"")||`item-${Date.now()}`;
const safeProduct=p=>{if(!p)return null;const {wholesale_price,cost_price,...safe}=p;return safe};
async function body(req){try{return await req.json()}catch{return null}}
function errorMessage(e){return e?.message||String(e)}

const te=new TextEncoder();
function b64u(bytes){let s="";for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}
function fromB64u(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";const bin=atob(s);return Uint8Array.from(bin,c=>c.charCodeAt(0))}
async function hmac(secret,data){const key=await crypto.subtle.importKey("raw",te.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign","verify"]);return new Uint8Array(await crypto.subtle.sign("HMAC",key,te.encode(data)))}
function constantTimeEqual(a,b){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a[i]^b[i];return x===0}
function getCookie(req,name){const raw=req.headers.get("Cookie")||"";for(const part of raw.split(";")){const [k,...rest]=part.trim().split("=");if(k===name)return rest.join("=")}return ""}
async function makeSession(secret){const exp=Math.floor(Date.now()/1000)+86400;const payload=`admin.${exp}`;const sig=b64u(await hmac(secret,payload));return `${payload}.${sig}`}
async function verifySession(req,secret){if(!secret)return false;const token=getCookie(req,"gm_admin");const parts=token.split(".");if(parts.length!==3||parts[0]!=="admin")return false;const exp=Number(parts[1]);if(!Number.isFinite(exp)||exp<Math.floor(Date.now()/1000))return false;try{const expected=await hmac(secret,`${parts[0]}.${parts[1]}`);return constantTimeEqual(expected,fromB64u(parts[2]));}catch{return false}}
function sessionCookie(token){return `gm_admin=${token}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Strict`}
function clearSessionCookie(){return "gm_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict"}
async function requireAdmin(req,env){return verifySession(req,text(env.ADMIN_SECRET))}

function whatsappUrl(env,order){const n=text(env.WHATSAPP)||"201151054863";const msg=[`🌿 ${text(env.STORE_NAME)||"Green Moon Plants & Flowers"}`,`طلب جديد #${order.id}`,`العميل: ${order.name}`,`الهاتف: ${order.phone}`,`WhatsApp: ${order.whatsapp||"-"}`,"", "المنتجات:",...order.items.map(i=>`${i.quantity} × ${i.productName} = ${i.total} جنيه`),"",`الإجمالي: ${order.total} جنيه`,`التوصيل: ${order.governorate||"-"} - ${order.area||"-"} - عقار ${order.building||"-"} - دور ${order.floor||"-"} - شقة ${order.apartment||"-"}`,`ملاحظات: ${order.notes||"-"}`].join("\n");return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`}

async function api(req,env,url){
 const p=url.pathname,m=req.method;
 if(m==="OPTIONS")return new Response(null,{status:204,headers:CORS});
 try{
  if(p==="/api/store"&&m==="GET"){
   const [cats,products,offers,flash,articles,reviews,settings,cms,menu]=await Promise.all([
    env.DB.prepare("SELECT id,name,slug,image_url,description,sort_order,active FROM categories WHERE active=1 ORDER BY sort_order,id").all(),
    env.DB.prepare("SELECT * FROM products WHERE is_available=1 ORDER BY is_featured DESC,sort_order,id DESC").all(),
    env.DB.prepare("SELECT * FROM offers WHERE active=1 AND (start_at IS NULL OR start_at='' OR start_at<=CURRENT_TIMESTAMP) AND (end_at IS NULL OR end_at='' OR end_at>=CURRENT_TIMESTAMP) ORDER BY id DESC").all(),
    env.DB.prepare("SELECT * FROM flash_sales WHERE active=1 AND (start_at IS NULL OR start_at='' OR start_at<=CURRENT_TIMESTAMP) AND (end_at IS NULL OR end_at='' OR end_at>=CURRENT_TIMESTAMP) ORDER BY id DESC").all(),
    env.DB.prepare("SELECT * FROM articles WHERE published=1 ORDER BY published_at DESC,id DESC LIMIT 12").all(),
    env.DB.prepare("SELECT * FROM reviews WHERE active=1 ORDER BY id DESC LIMIT 12").all(),
    env.DB.prepare("SELECT key,value FROM settings").all(),env.DB.prepare("SELECT key,value FROM cms_content").all(),
    env.DB.prepare("SELECT * FROM menu_items WHERE active=1 ORDER BY sort_order,id").all()
   ]);
   return ok({categories:cats.results||[],products:(products.results||[]).map(safeProduct),offers:offers.results||[],flashSales:flash.results||[],articles:articles.results||[],reviews:reviews.results||[],settings:Object.fromEntries((settings.results||[]).map(x=>[x.key,x.value])),cms:Object.fromEntries((cms.results||[]).map(x=>[x.key,x.value])),menu:menu.results||[]});
  }
  if(p==="/api/products"&&m==="GET"){
   const q=text(url.searchParams.get("q")),cat=int(url.searchParams.get("category"));let sql="SELECT * FROM products WHERE is_available=1";const args=[];
   if(q){sql+=" AND (name LIKE ? OR description LIKE ?)";args.push(`%${q}%`,`%${q}%`)}if(cat){sql+=" AND category_id=?";args.push(cat)}sql+=" ORDER BY is_featured DESC,sort_order,id DESC LIMIT 100";const r=await env.DB.prepare(sql).bind(...args).all();return ok({products:(r.results||[]).map(safeProduct)});
  }
  const pm=p.match(/^\/api\/products\/(\d+)$/);if(pm&&m==="GET"){
   const id=int(pm[1]);const r=await env.DB.prepare("SELECT * FROM products WHERE id=? AND is_available=1").bind(id).first();if(!r)return fail("PRODUCT_NOT_FOUND","المنتج غير موجود",404);
   const [imgs,similar]=await Promise.all([env.DB.prepare("SELECT * FROM product_images WHERE product_id=? ORDER BY sort_order,id").bind(id).all(),r.category_id?env.DB.prepare("SELECT * FROM products WHERE category_id=? AND id<>? AND is_available=1 ORDER BY is_featured DESC,sort_order,id DESC LIMIT 8").bind(r.category_id,id).all():{results:[]}]);return ok({product:{...safeProduct(r),images:imgs.results||[]},similar:(similar.results||[]).map(safeProduct)});
  }
  if(p==="/api/categories"&&m==="GET"){const r=await env.DB.prepare("SELECT * FROM categories WHERE active=1 ORDER BY sort_order,id").all();return ok({categories:r.results||[]})}
  if(p==="/api/offers"&&m==="GET"){const r=await env.DB.prepare("SELECT * FROM offers WHERE active=1 ORDER BY id DESC").all();return ok({offers:r.results||[]})}
  if(p==="/api/articles"&&m==="GET"){const r=await env.DB.prepare("SELECT * FROM articles WHERE published=1 ORDER BY published_at DESC,id DESC").all();return ok({articles:r.results||[]})}
  if(p.startsWith("/api/article/")&&m==="GET"){const slug=decodeURIComponent(p.slice(13));const r=await env.DB.prepare("SELECT * FROM articles WHERE slug=? AND published=1").bind(slug).first();if(!r)return fail("ARTICLE_NOT_FOUND","المقال غير موجود",404);return ok({article:r})}
  if(p==="/api/orders"&&m==="POST"){
   const b=await body(req);if(!b||!text(b.name)||!text(b.phone)||!Array.isArray(b.items)||!b.items.length)return fail("INVALID_ORDER","الاسم ورقم الهاتف والمنتجات مطلوبة",422);
   const ids=[...new Set(b.items.map(x=>int(x.productId)).filter(Boolean))];if(!ids.length)return fail("INVALID_ORDER","المنتجات غير صحيحة",422);
   const rows=await env.DB.prepare(`SELECT id,name,price,stock,is_available FROM products WHERE id IN (${ids.map(()=>"?").join(",")})`).bind(...ids).all();const map=new Map((rows.results||[]).map(x=>[x.id,x]));let subtotal=0;const items=[];
   for(const i of b.items){const q=Math.max(1,int(i.quantity,1)),pr=map.get(int(i.productId));if(!pr||!pr.is_available)return fail("PRODUCT_UNAVAILABLE",`المنتج غير متاح`,409);if(pr.stock<q)return fail("INSUFFICIENT_STOCK",`الكمية المتاحة من ${pr.name} غير كافية`,409);const total=pr.price*q;subtotal+=total;items.push({productId:pr.id,productName:pr.name,quantity:q,unitPrice:pr.price,total})}
   const delivery=Math.max(0,num(b.deliveryFee,0)),total=subtotal+delivery;
   const c=await env.DB.prepare("INSERT INTO customers(name,phone,whatsapp,governorate,area,building,floor,apartment) VALUES(?,?,?,?,?,?,?,?)").bind(text(b.name),text(b.phone),text(b.whatsapp),text(b.governorate),text(b.area),text(b.building),text(b.floor),text(b.apartment)).run();
   const cid=c.meta.last_row_id;const o=await env.DB.prepare("INSERT INTO orders(customer_id,name,phone,whatsapp,governorate,area,building,floor,apartment,notes,subtotal,delivery_fee,total,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(cid,text(b.name),text(b.phone),text(b.whatsapp),text(b.governorate),text(b.area),text(b.building),text(b.floor),text(b.apartment),text(b.notes),subtotal,delivery,total,"new").run();const oid=o.meta.last_row_id;
   for(const i of items){await env.DB.prepare("INSERT INTO order_items(order_id,product_id,product_name,quantity,unit_price,total) VALUES(?,?,?,?,?,?)").bind(oid,i.productId,i.productName,i.quantity,i.unitPrice,i.total).run();await env.DB.prepare("UPDATE products SET stock=MAX(0,stock-?),updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(i.quantity,i.productId).run()}
   return ok({orderId:oid,total,whatsapp:whatsappUrl(env,{id:oid,name:text(b.name),phone:text(b.phone),whatsapp:text(b.whatsapp),governorate:text(b.governorate),area:text(b.area),building:text(b.building),floor:text(b.floor),apartment:text(b.apartment),notes:text(b.notes),items,total})});
  }

  if(p==="/api/admin/login"&&m==="POST"){
   const b=await body(req),password=text(b?.password),secret=text(env.ADMIN_SECRET);if(!secret)return fail("ADMIN_NOT_CONFIGURED","ADMIN_SECRET غير مضبوط",503);
   const a=te.encode(password),s=te.encode(secret);if(!constantTimeEqual(a,s))return fail("INVALID_CREDENTIALS","كلمة السر غير صحيحة",401);
   const token=await makeSession(secret);return json({success:true,admin:true},200,{"set-cookie":sessionCookie(token)});
  }
  if(p==="/api/admin/me"&&m==="GET")return verifySession(req,text(env.ADMIN_SECRET))?ok({admin:true}):fail("UNAUTHORIZED","يجب تسجيل الدخول",401);
  if(p==="/api/admin/logout"&&m==="POST")return json({success:true},200,{"set-cookie":clearSessionCookie()});
  if(p.startsWith("/api/admin/")){
   if(!(await requireAdmin(req,env)))return fail("UNAUTHORIZED","يجب تسجيل الدخول إلى لوحة التحكم",401);
   if(p==="/api/admin/dashboard"&&m==="GET"){
    const [pds,cus,ord,art,sales,low]=await Promise.all([env.DB.prepare("SELECT COUNT(*) n FROM products").first(),env.DB.prepare("SELECT COUNT(*) n FROM customers").first(),env.DB.prepare("SELECT COUNT(*) n FROM orders").first(),env.DB.prepare("SELECT COUNT(*) n FROM articles").first(),env.DB.prepare("SELECT COALESCE(SUM(total),0) n FROM orders WHERE status!='cancelled'").first(),env.DB.prepare("SELECT COUNT(*) n FROM products WHERE stock<=5 AND is_available=1").first()]);return ok({stats:{products:pds.n,customers:cus.n,orders:ord.n,articles:art.n,sales:sales.n,lowStock:low.n}})
   }
   if(p==="/api/admin/products"&&m==="GET"){const r=await env.DB.prepare("SELECT * FROM products ORDER BY sort_order,id DESC").all();return ok({products:r.results||[]})}
   if(p==="/api/admin/products"&&m==="POST")return productWrite(env,await body(req),null)
   const ap=p.match(/^\/api\/admin\/products\/(\d+)$/);if(ap&&(m==="PUT"||m==="DELETE")){const id=int(ap[1]);if(m==="DELETE"){await env.DB.prepare("DELETE FROM products WHERE id=?").bind(id).run();return ok()}return productWrite(env,await body(req),id)}
   if(p==="/api/admin/product-images"&&m==="POST"){const b=await body(req);if(!int(b?.productId)||!text(b?.imageUrl))return fail("VALIDATION","بيانات الصورة ناقصة",422);const r=await env.DB.prepare("INSERT INTO product_images(product_id,image_url,sort_order) VALUES(?,?,?)").bind(int(b.productId),text(b.imageUrl),int(b.sortOrder)).run();return ok({id:r.meta.last_row_id})}
   if(p.startsWith("/api/admin/product-images/")&&m==="DELETE"){const id=int(p.split("/").pop());await env.DB.prepare("DELETE FROM product_images WHERE id=?").bind(id).run();return ok()}
   const simple={categories:{table:"categories",fields:["name","slug","image_url","description","sort_order","active"]},offers:{table:"offers",fields:["title","description","image_url","price","old_price","start_at","end_at","active"]},flash_sales:{table:"flash_sales",fields:["title","description","image_url","start_at","end_at","active"]},articles:{table:"articles",fields:["title","slug","content","image_url","category","published","published_at"]},reviews:{table:"reviews",fields:["product_id","name","rating","content","active"]},menu:{table:"menu_items",fields:["label","target","sort_order","active"]}};
   for(const [key,s] of Object.entries(simple)){
    const path=key==="menu"?"menu":key;
    if(p===`/api/admin/${path}`&&m==="GET"){const r=await env.DB.prepare(`SELECT * FROM ${s.table} ORDER BY ${s.table==="menu_items"?"sort_order,id":"id DESC"}`).all();return ok({[key]:r.results||[]})}
    if(p===`/api/admin/${path}`&&m==="POST"){const b=await body(req);const vals=s.fields.map(f=>b?.[f]??"");const r=await env.DB.prepare(`INSERT INTO ${s.table}(${s.fields.join(",")}) VALUES(${s.fields.map(()=>"?").join(",")})`).bind(...vals).run();return ok({id:r.meta.last_row_id})}
    const sm=p.match(new RegExp(`^/api/admin/${path}/(\\d+)$`));if(sm&&(m==="PUT"||m==="DELETE")){const id=int(sm[1]);if(m==="DELETE"){await env.DB.prepare(`DELETE FROM ${s.table} WHERE id=?`).bind(id).run();return ok()}const b=await body(req);await env.DB.prepare(`UPDATE ${s.table} SET ${s.fields.map(f=>`${f}=?`).join(",")},updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(...s.fields.map(f=>b?.[f]??""),id).run();return ok()}
   }
   if(p==="/api/admin/orders"&&m==="GET"){const r=await env.DB.prepare("SELECT * FROM orders ORDER BY id DESC").all();return ok({orders:r.results||[]})}
   const om=p.match(/^\/api\/admin\/orders\/(\d+)$/);if(om&&m==="PUT"){const b=await body(req);const allowed=["new","confirmed","delivering","done","cancelled"];const status=allowed.includes(text(b?.status))?text(b.status):"new";await env.DB.prepare("UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status,int(om[1])).run();return ok()}
   if(p==="/api/admin/settings"&&(m==="GET"||m==="PUT")){if(m==="GET"){const r=await env.DB.prepare("SELECT key,value FROM settings").all();return ok({settings:Object.fromEntries((r.results||[]).map(x=>[x.key,x.value]))})}const b=await body(req);for(const [k,v] of Object.entries(b||{}))await env.DB.prepare("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP").bind(k,String(v)).run();return ok()}
   if(p==="/api/admin/cms"&&(m==="GET"||m==="PUT")){if(m==="GET"){const r=await env.DB.prepare("SELECT key,value FROM cms_content").all();return ok({cms:Object.fromEntries((r.results||[]).map(x=>[x.key,x.value]))})}const b=await body(req);for(const [k,v] of Object.entries(b||{}))await env.DB.prepare("INSERT INTO cms_content(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP").bind(k,String(v)).run();return ok()}
   return fail("NOT_FOUND","المسار الإداري غير موجود",404)
  }
  return null;
 }catch(e){return fail("SERVER_ERROR","حدث خطأ في الخادم",500,errorMessage(e))}
}
async function productWrite(env,b,id){
 if(!b||!text(b.name))return fail("VALIDATION","اسم المنتج مطلوب",422);const slug=text(b.slug)||slugify(b.name);const vals=[text(b.name),slug,text(b.description),text(b.imageUrl||b.image_url),b.categoryId?int(b.categoryId):null,num(b.price),num(b.oldPrice||b.old_price),num(b.wholesalePrice||b.wholesale_price),num(b.costPrice||b.cost_price),Math.max(0,int(b.stock)),b.isAvailable===false||b.is_available===0?0:1,bool(b.isFeatured??b.is_featured)?1:0,int(b.sortOrder??b.sort_order),text(b.badge),num(b.discountPercent??b.discount_percent)];
 if(id){await env.DB.prepare("UPDATE products SET name=?,slug=?,description=?,image_url=?,category_id=?,price=?,old_price=?,wholesale_price=?,cost_price=?,stock=?,is_available=?,is_featured=?,sort_order=?,badge=?,discount_percent=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(...vals,id).run();return ok({id})}
 const r=await env.DB.prepare("INSERT INTO products(name,slug,description,image_url,category_id,price,old_price,wholesale_price,cost_price,stock,is_available,is_featured,sort_order,badge,discount_percent) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(...vals).run();return ok({id:r.meta.last_row_id})
}
export default {async fetch(req,env){const url=new URL(req.url);if(url.pathname.startsWith("/api/")){const r=await api(req,env,url);if(r)return r}return env.ASSETS.fetch(req)}};
