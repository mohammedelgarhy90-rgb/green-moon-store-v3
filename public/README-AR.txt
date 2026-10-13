Green Moon — Root Cause Fix (2026-10-13)

Files included:
- public/index.html
- public/admin.html

Root causes addressed in these files:
1. Admin visual builder replaced the entire gm_site object on save, which discarded previously saved splash/media/content/footer settings. It now merges the previous nested objects before saving.
2. Home builder values were saved but not consistently applied on the storefront. Rendering now applies selected products, headings, banners, service rows and visibility flags.
3. The page now respects show/hide flags for the major homepage sections and the ticker setting.
4. Splash fallback duration is 5 seconds, matching the previously requested duration.

IMPORTANT LIMITATIONS:
- This patch is based on the user-provided archive green-moon-store-v3-main-١٠.zip, not a live export from Cloudflare. Confirm it matches the currently deployed commit before replacing files.
- No Worker/backend code was changed; API schema or missing features in worker.js may need a separate fix.
- JavaScript syntax checks are not a substitute for end-to-end browser testing. After deployment test: admin saves, reload, product/cart/checkout, deals, order status, notification subscription, and mobile navigation.
- Back up the current two files and current settings before deploying. Do not replace worker.js or wrangler.toml with this patch.
