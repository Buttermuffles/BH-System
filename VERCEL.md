Vercel deployment notes

- This repository contains a Laravel application with a Vite React frontend.
- The original `vercel.json` attempted to use `@vercel/php`, but Vercel's builder install failed during deployment (builder not available from npm).
   To avoid that failure, `vercel.json` now performs a static build of the frontend only.

Quick steps to deploy on Vercel

1. In the Vercel project settings, set the root to the repository root.
2. Vercel will detect `package.json` and `composer.json` and run the appropriate builders.
3. Environment variables: copy any required Laravel env vars into Vercel (APP_KEY, DB_*, MAIL_*, etc.).
4. Build behavior:
   - The static builder runs `npm run build` (already defined) and places assets under `public/build`.
   - The repository no longer attempts to install a PHP builder on Vercel. Laravel's PHP backend will NOT be hosted by Vercel with the current config.

Notes & caveats

- Blade/PHP pages will NOT be handled by Vercel in this configuration. If you need server-side Laravel, host it on a PHP-capable provider (DigitalOcean App Platform, Render, a VPS, etc.) and point your frontend to that API.
- If you only intend to deploy the frontend to Vercel, the current config will serve static assets from `public/`.

Workarounds:

- Deploy frontend to Vercel (static) and Laravel backend to another host; configure CORS and API endpoints accordingly.
- Alternatively, if Vercel restores/updates `@vercel/php` availability, we can reintroduce the PHP builder.
