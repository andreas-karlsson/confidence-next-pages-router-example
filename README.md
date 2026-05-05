# Confidence local resolver — Next.js Pages Router demo

A minimal reference for using the [Spotify Confidence local OpenFeature provider](https://github.com/spotify/confidence-resolver/tree/main/openfeature-provider/js) with the **Next.js Pages Router**. Mirrors the App Router integration but uses `getServerSideProps` + a client wrapper instead of RSC.

## What it shows

- **`instrumentation.ts`** registers the Confidence provider with OpenFeature once at server startup.
- **`pages/index.tsx`** uses `withConfidence(...)` from `@spotify-confidence/openfeature-server-provider-local/pages-router/server` to resolve a flag bundle for the request without firing exposure, and `useFlagDetails` from `react-client` to read flag values on the client. Exposure is logged when the hook fires (POST to `/api/confidence/apply`).
- **`pages/_app.tsx`** wraps the page tree with `<ConfidencePagesProvider>` so the hooks have a bundle to read from.
- **`pages/api/confidence/apply.ts`** is a one-line `applyHandler()` mount that closes the loop on exposure logging.
- **`pages/api/visitor/reset.ts`** clears the demo's visitor cookie so the "Re-sample variant" button can roll a fresh targeting key (demo-only, not something a real app would expose).

The page also resolves a second flag (`main-page.redirect`) via the standard `OpenFeature.getClient().getObjectValue(...)` flow inside `getServerSideProps` to demonstrate that the bundle path doesn't replace direct OpenFeature usage — it's additive. If `main-page.redirect` returns `{ enabled: true, url: ... }`, the page redirects server-side before rendering.

## Running it

1. **Set up environment variables.** Copy `.env.local.example` to `.env.local` and fill in:
   - `CONFIDENCE_FLAG_CLIENT_SECRET` — your Confidence backend integration secret.
   - `CONFIDENCE_TOKEN_KEY` — any 32-byte hex string used to seal the resolve token before it reaches the browser. Generate with: `openssl rand -hex 32`.
2. **Configure flags in your Confidence project.** The demo expects (or falls back to defaults for):
   - `tutorial-feature` — any object flag. Whatever variant payload you configure shows up in the page.
   - `main-page.redirect` (optional) — object flag with shape `{ enabled: false } | { enabled: true, url: string }`. Triggers a server-side redirect when enabled.
3. **Install and start.**
   ```bash
   yarn install
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Lib via vendored tarball

The dependency on `@spotify-confidence/openfeature-server-provider-local` is currently a `file:./vendor/openfeature-server-provider-local.tgz` reference rather than an npm version, because the Pages Router subexports are unreleased. Once the upstream release ships, replace the `file:` ref with the published version and delete `vendor/`.

## Layout

```
src/
├── instrumentation.ts                 ← registers OpenFeature provider once at startup
├── server/visitor-id.ts               ← demo cookie helper for the targeting key
├── pages/
│   ├── _app.tsx                       ← <ConfidencePagesProvider> wrapper
│   ├── index.tsx                      ← withConfidence + useFlagDetails + redirect flag
│   └── api/
│       ├── confidence/apply.ts        ← one-line applyHandler() mount
│       └── visitor/reset.ts           ← demo-only cookie reset for the re-sample button
└── styles/                            ← Geist font + scoped CSS
```
