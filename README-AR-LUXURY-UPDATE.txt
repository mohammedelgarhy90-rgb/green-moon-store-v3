Green Moon luxury + admin sync update — 2026-10-13

Files to replace in the repository:
- public/index.html
- public/admin.html

What changed:
- Full luxury styling refresh in emerald, champagne gold and ivory while preserving existing product imagery.
- Added an About Green Moon section and editable fields in Admin > التحكم الكامل في واجهة الموقع.
- Replaced generic contact glyphs with inline SVG brand/function icons for Instagram, WhatsApp and phone.
- Facebook and TikTok icons stay hidden until their real URLs are entered in the admin panel.
- Fixed homepage rendering to use saved home-builder services, section visibility, headings and selected new-product IDs.
- Fixed admin save behavior so editing the main visual builder preserves existing splash, footer, media and content settings instead of replacing them.
- Connected the news ticker to saved gm_ticker messages, enable/disable and speed settings.

Deploy carefully:
1. Commit these two files to the matching public/ folder in GitHub.
2. Keep worker.js, wrangler.toml, KV bindings and stored data unchanged for this front-end patch.
3. Deploy to a Cloudflare preview first, then verify homepage, products, deals, cart, checkout, admin settings, and mobile layout.
4. In Admin > التحكم الكامل في الواجهة, enter the actual Facebook/TikTok URLs before those icons can appear.

Checks performed: HTML files updated; next run JavaScript syntax validation before upload. This package is not deployed and has not been end-to-end browser tested.
