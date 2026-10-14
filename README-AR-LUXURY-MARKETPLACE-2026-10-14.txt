Green Moon Luxury Marketplace — build 2026-10-14

This build keeps the existing Cloudflare Worker, KV namespace configuration, product/order APIs, PWA, WhatsApp contact, checkout, customer accounts, order tracking, courier page, Plant Doctor, visualizer, deals, vouchers, and existing admin panel.

Storefront enhancements:
- Responsive product search by name/category/details.
- Sorting by price, name, and savings.
- Favorites stored locally on the customer's device, with per-product heart buttons and favorites-only view.
- More polished marketplace spacing, product-card interactions, mobile toolbar, and empty-search feedback.

Admin enhancements:
- Fixed malformed product modal action buttons.
- Explicit save-failure status and product-name validation.
- Order search by order number, customer name, or phone, plus status filtering.

Deployment:
- Cloudflare Worker entry remains worker.js.
- Static assets remain in ./public as configured in wrangler.toml.
- Deploy the full project folder, not just index.html. Keep existing Worker environment variables and KV binding.
- This archive has not been deployed to the live Worker from this environment. Test login, product edits, image uploads, cart/checkout, orders, deals, and notifications in a staging or controlled session before replacing the live version.
