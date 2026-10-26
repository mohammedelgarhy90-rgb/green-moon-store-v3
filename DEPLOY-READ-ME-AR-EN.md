# Green Moon Store v3 — isolated deployment package

## Important
This is a deployment-preparation package, not a deployed or runtime-tested website.
The source files are based on the saved archive dated 2026-10-15; they have not been verified against the latest production commit.

## Safety setup before deployment
1. Create a NEW KV namespace in Cloudflare for testing.
2. Replace `REPLACE_WITH_NEW_TEST_KV_NAMESPACE_ID` in `wrangler.toml` with that new test namespace ID.
3. Set separate test secrets in the new Worker settings (at minimum `ADMIN_PASSWORD`; set `COURIER_PASSWORD` separately if used). Do not copy production secrets.
4. Ensure this Worker has no production KV binding and no production custom domain/routes.
5. Deploy only to the new test Worker name `green-moon-store-v3-test`.
6. Test with fake customer/order data only.

## Deployment routes
The Cloudflare inline "Edit code" screen shown in the mobile screenshot is not a ZIP project uploader.
Do not paste `worker.js` into the inline editor: the project includes multiple HTML assets and an assets binding.
Use a project-aware deployment flow (for example, a separate GitHub repository/branch configured to deploy to the test Worker, or Wrangler from a development environment) after the new KV namespace has been created.

## What has and has not been checked
- ZIP archive integrity: checked.
- Required core files: present.
- Production KV namespace ID: removed from this package's `wrangler.toml`.
- Cloudflare deployment: NOT performed.
- Runtime checkout/order/admin tests: NOT performed.
