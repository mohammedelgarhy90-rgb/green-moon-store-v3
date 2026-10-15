# Green Moon — Rebuilt Storefront Phase 1

## What's included
- A newly rebuilt Arabic RTL storefront with a luxury forest-green / gold visual system.
- Responsive desktop/mobile navigation, hero, category tiles, product cards, search, favorites, deals section, cart, checkout form and customer footer.
- Storefront reads existing live data through the current Worker APIs: `/api/products`, `/api/deals`, `/api/settings`, `/api/shipping`, `/api/logo`, and submits orders to `/api/orders`.
- Existing `worker.js`, `wrangler.toml`, admin/account/tracking/courier/deals pages and public assets are carried forward from the supplied project archive. They were not rewritten in this phase.
- No KV namespace IDs, Durable Object bindings, or product/order data are deleted or reset.

## Important notes
- This is a rebuild package for review, not a claim that the live site has been deployed.
- The storefront uses the existing API contract; checkout, product schema compatibility, admin integration, mobile layout, and order persistence must be tested in a staging/development Worker before production deployment.
- Existing project assets and administrative pages are included to preserve continuity. A later phase should rebuild and validate admin UX separately, then test all workflows end-to-end.
- Do not run any KV reset or database deletion commands.
