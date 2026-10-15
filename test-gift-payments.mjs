import worker, { GiftCardLedger } from '../worker.js';
import assert from 'node:assert/strict';
class KV {
  constructor(seed={}){this.m=new Map(Object.entries(seed));}
  async get(k,type){const v=this.m.get(k);if(v==null)return null;if(type==='json'){try{return JSON.parse(v)}catch{return null}}return v;}
  async put(k,v){this.m.set(k,String(v));}
  async delete(k){this.m.delete(k)}
  async list({prefix='',limit=1000}={}){return {keys:[...this.m.keys()].filter(k=>k.startsWith(prefix)).slice(0,limit).map(name=>({name}))};}
}
class DOStorage {
  constructor(){this.m=new Map();this.tail=Promise.resolve();}
  async get(k){return this.m.get(k)}
  async put(k,v){this.m.set(k,v)}
  async transaction(fn){const run=this.tail.then(()=>fn(this));this.tail=run.catch(()=>{});return run}
}
class GiftLedgerNamespace {
  constructor(){this.objects=new Map()}
  idFromName(name){return name}
  get(id){if(!this.objects.has(id)){const state={storage:new DOStorage()};this.objects.set(id,{fetch:(url,init)=>new GiftCardLedger(state,{}).fetch(new Request(url,init))})}return this.objects.get(id)}
}
const kv=new KV({'settings':JSON.stringify({gm_gift_cards_payment:{enabled:true,instapayAddress:'greenmoon@instapay',receiverName:'Green Moon',receiverPhone:'01000000000',amounts:[250,500,1000],instructions:'حوّل المبلغ كما هو.'}})});
const env={GREEN_MOON_KV:kv,ADMIN_PASSWORD:'test-password',GIFT_CARD_LEDGER:new GiftLedgerNamespace()};
const ctx={waitUntil(){}};
async function call(path,method='GET',body,admin=false,ip=''){return worker.fetch(new Request('https://local.test'+path,{method,headers:{...(body?{'content-type':'application/json'}:{}),...(admin?{authorization:'Bearer test-password'}:{}),...(ip?{'CF-Connecting-IP':ip}:{})},body:body?JSON.stringify(body):undefined}),env,ctx)}
const cfg=await call('/api/gift-cards/config');assert.equal(cfg.status,200);assert.equal((await cfg.json()).enabled,true);
let res=await call('/api/gift-cards/payment-requests','POST',{amount:400,senderName:'Mohamed',recipientName:'Marwa',recipientPhone:'01012345678'},false,'203.0.113.5');assert.equal(res.status,400,'amount must be from configured values');
res=await call('/api/gift-cards/payment-requests','POST',{amount:500,senderName:'Mohamed',recipientName:'Marwa',recipientPhone:'01012345678',deliveryMethod:'digital',message:'كل سنة وانتي طيبة'},false,'203.0.113.5');assert.equal(res.status,201);const created=(await res.json()).request;assert.ok(created.id&&created.token);
res=await call('/api/gift-cards/payment-requests','POST',{amount:500,senderName:'Mohamed',recipientName:'Marwa',recipientPhone:'01012345678'},false,'203.0.113.5');assert.equal(res.status,429,'rate limit must reject rapid repeated requests');
res=await call('/api/admin/gift-card-payments','PUT',{id:created.id,action:'approve'},true);assert.equal(res.status,409,'must not activate without receipt');
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/k0sAAAAASUVORK5CYII=';
res=await call('/api/gift-cards/receipt','POST',{id:created.id,token:created.token,receiptDataUrl:'data:image/png;base64,'+png,transferReference:'REF123'});assert.equal(res.status,200);assert.equal((await res.json()).status,'pending_review');
res=await call('/api/admin/gift-card-receipt?id='+encodeURIComponent(created.id),'GET',null,true);assert.equal(res.status,200);assert.ok((await res.json()).dataUrl.startsWith('data:image/png;base64,'));
res=await call('/api/admin/gift-card-payments','PUT',{id:created.id,action:'approve'},true);assert.equal(res.status,200);const approved=(await res.json());assert.ok(approved.item.giftCardCode);
const cardCountBefore=[...kv.m.keys()].filter(k=>k.startsWith('giftcard:')).length;res=await call('/api/admin/gift-card-payments','PUT',{id:created.id,action:'approve'},true);assert.equal(res.status,200);assert.equal((await res.json()).item.giftCardCode,approved.item.giftCardCode,'repeat approval must be idempotent');assert.equal([...kv.m.keys()].filter(k=>k.startsWith('giftcard:')).length,cardCountBefore);
res=await call('/api/gift-cards/status?id='+encodeURIComponent(created.id)+'&token='+encodeURIComponent(created.token));assert.equal(res.status,200);const status=await res.json();assert.equal(status.status,'approved');assert.equal(status.giftCardCode,approved.item.giftCardCode);
const card=await kv.get('giftcard:'+status.giftCardCode,'json');assert.equal(card.balance,500);assert.equal(card.status,'active');
// Checkout redemption: server-side price/shipping, one-time deduction, retry idempotency.
card.balance=120;await kv.put('giftcard:'+status.giftCardCode,JSON.stringify(card));
await kv.put('products',JSON.stringify([{id:1,name:'Plant test',price:100,shippingPrice:20,image:'/test.jpg'}]));
res=await call('/api/gift-cards/validate','POST',{code:status.giftCardCode});assert.equal(res.status,200);assert.equal((await res.json()).balance,120);
const orderBody={idempotencyKey:'GMREQ-test-unique-key-000001',name:'Mohamed',phone:'01012345678',items:[{productId:1,quantity:1}],giftCardCode:status.giftCardCode};
res=await call('/api/orders','POST',orderBody);assert.equal(res.status,200);const order1=(await res.json()).order;assert.equal(order1.total,0);assert.equal(order1.giftCardDiscount,120);assert.equal(order1.giftCardStatus,'applied');
res=await call('/api/orders','POST',orderBody);assert.equal(res.status,200);assert.equal((await res.json()).duplicate,true,'same checkout attempt should return existing order');
res=await call('/api/gift-cards/validate','POST',{code:status.giftCardCode});assert.equal(res.status,200);assert.equal((await res.json()).balance,0,'gift balance must be deducted exactly once');
res=await call('/api/orders','POST',{...orderBody,idempotencyKey:'GMREQ-test-unique-key-000002'});assert.equal(res.status,400,'zero-balance gift card cannot be reused');
await kv.put('giftcard:GM-PARTIALTEST',JSON.stringify({code:'GM-PARTIALTEST',amount:500,balance:500,status:'active'}));
const partialBody={...orderBody,idempotencyKey:'GMREQ-test-partial-card-000001',giftCardCode:'GM-PARTIALTEST'};
res=await call('/api/orders','POST',partialBody);assert.equal(res.status,200);const partialOrder=(await res.json()).order;assert.equal(partialOrder.giftCardDiscount,120);assert.equal(partialOrder.total,0);
res=await call('/api/gift-cards/validate','POST',{code:'GM-PARTIALTEST'});assert.equal(res.status,200);assert.equal((await res.json()).balance,380,'unused balance must remain on partially used card');
res=await call('/api/admin/gift-card-payments','GET',null,false);assert.equal(res.status,401,'admin endpoint must require auth');
res=await call('/api/admin/gift-card-payments','GET',null,true);assert.equal(res.status,200);const rows=await res.json();assert.equal(rows.length,1);assert.equal(rows[0].status,'approved');
// Durable Object serializes concurrent redemptions so the balance cannot go negative.
const concurrentState={storage:new DOStorage()};const concurrentDO=new GiftCardLedger(concurrentState,{});
const mkRedeem=(orderId)=>concurrentDO.fetch(new Request('https://ledger.local/redeem',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'redeem',active:true,initialBalance:100,amount:80,orderId})}));
const concurrentResults=await Promise.all([mkRedeem('ORDER-A'),mkRedeem('ORDER-B')]);
assert.equal(concurrentResults.filter(x=>x.status===200).length,1,'only one concurrent debit may succeed');
assert.equal(concurrentResults.filter(x=>x.status===409).length,1,'second concurrent debit must fail for insufficient balance');
assert.equal(await concurrentState.storage.get('balance'),20,'balance must never go negative');
console.log('PASS: manual InstaPay gift payment lifecycle, approval controls, receipt privacy, gift-card validation, checkout balance redemption, retry idempotency, zero-balance rejection, and concurrent-debit serialization');
