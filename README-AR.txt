Green Moon — Visual Repair Patch
Date: 2026-10-13

Includes:
- public/index.html: 3-second splash target, visible logo fallback if logo asset fails,
  product images use contain to reduce cropping, and mobile drawer overlays the page
  instead of appearing under the header.
- public/admin.html: unchanged safety/reference copy.

IMPORTANT:
1. This patch only modifies storefront HTML/CSS; it does not contain worker.js and does not touch KV/database data.
2. Back up the deployed public/index.html first.
3. Upload ONLY public/index.html to the matching public/index.html path, after confirming it matches the currently deployed build.
4. Do not replace worker.js, wrangler.toml, assets, or product data using this patch.
5. The exact selectors and behavior still require testing against the deployed version. If the site currently uses a different index.html than this source, do not upload until the files are reconciled.
