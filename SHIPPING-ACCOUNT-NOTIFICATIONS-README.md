# Green Moon — نظام الحسابات والتتبع والشحن والإشعارات

التعديلات الجديدة:
- حساب عميل اختياري (تسجيل/دخول/طلبات سابقة).
- الشراء كزائر بدون حساب.
- Tracking Token خاص وآمن لكل طلب.
- صفحة `public/track.html` للتتبع.
- صفحة `public/account.html` للحساب والطلبات وتفضيلات الإشعارات.
- صفحة `public/courier.html` لشركة الشحن.
- تحديثات حالة الطلب مع Timeline.
- إشعارات Push للطلبات، المنتجات الجديدة، والعروض.
- Service Worker في `public/sw.js`.
- قسم إشعارات جديد في لوحة الإدارة.
- الإشعارات اليدوية من لوحة الإدارة عبر `/api/admin/notifications`.

## تشغيل شركة الشحن

ضع Secret في Cloudflare باسم:
`COURIER_PASSWORD`

إذا لم يتم وضعه، النظام يسمح مؤقتًا باستخدام `ADMIN_PASSWORD` كبديل.

## ملاحظة الإشعارات

النظام يولّد VAPID key pair تلقائيًا ويخزنه في KV لأول مرة، لذلك لا تحتاج لإضافة VAPID keys يدويًا في هذه النسخة.

## الملفات الجديدة

- `public/account.html`
- `public/track.html`
- `public/courier.html`
- `public/sw.js`

## مهم

لا تضع صفحات العميل/شركة الشحن في الجذر؛ كلها داخل `public` لأن `wrangler.toml` يستخدم:
`[assets] directory = "./public"`
