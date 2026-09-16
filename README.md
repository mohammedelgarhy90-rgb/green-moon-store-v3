# Green Moon Store V3

Production-oriented Cloudflare Worker + D1 ecommerce project for Green Moon Plants & Flowers.

## Security
- Public store APIs do not expose `wholesale_price` or `cost_price`.
- Admin APIs require an authenticated HttpOnly session cookie.
- The admin login password is the Cloudflare Worker Secret named `ADMIN_SECRET`.
- Do not put the secret in source code, HTML, JavaScript, GitHub, or `wrangler.toml`.
- The old `green-moon-products` Worker is not used by this project.

## Cloudflare bindings
- D1 binding: `DB`
- Static assets binding: `ASSETS`
- Worker Secret: `ADMIN_SECRET`
- Optional vars: `STORE_NAME`, `WHATSAPP`

## Deploy
1. Keep the existing D1 database `green-moon-db` and its schema.
2. Keep the existing `ADMIN_SECRET` secret on Worker `green-moon-store`.
3. Deploy this complete project so `worker.js` and the `public/` directory are deployed together.
4. Open `/admin/` and enter the same password stored in `ADMIN_SECRET`.

## Important
Do not paste only `worker.js` into the dashboard and expect the complete storefront to deploy. This project depends on the `public/` static assets as well.
