# Confidence local resolver — Next.js Pages Router demo

A minimal reference for using the [Spotify Confidence local OpenFeature provider](https://github.com/spotify/confidence-resolver/tree/main/openfeature-provider/js) with the **Next.js Pages Router**. Mirrors the App Router integration but uses `getServerSideProps` + a client wrapper instead of RSC.

## What it shows

- **`instrumentation.ts`** registers the Confidence provider with OpenFeature once at server startup.
- **`proxy.ts`** builds the per-request OpenFeature evaluation context (visitor cookie, parsed user agent, language, plus an async lookup against REST Countries) once and forwards it to downstream handlers via an `x-cf-context` header. Same proxy works for App Router code during a gradual migration — that side reads the header via `next/headers`.
- **`pages/index.tsx`** uses `withFlags` (from `src/confidence-helpers/`) which composes `withConfidence` with an `applyBaseContext` decorator. `readBaseContext(ctx)` parses the proxy-attached header for direct OpenFeature use (the redirect flag); the bundle resolution sees the same context. `useFlagDetails` reads flag values on the client; exposure is tracked automatically when the hook first reads a flag.
- **`pages/promo.tsx`** demonstrates a page that returns its own context attribute (`is_promotional_page: true`) without reading the base. The `applyBaseContext` decorator merges it onto the proxy-derived base for resolution.
- **`pages/_app.tsx`** wraps the page tree with `<ConfidencePagesProvider>` so the hooks have a bundle to read from.
- **`pages/api/confidence/apply.ts`** is a one-line `applyHandler()` mount that closes the loop on exposure logging.
- **`pages/api/visitor/reset.ts`** clears the demo's visitor cookie so the "Re-sample variant" button can roll a fresh targeting key on the next request (the proxy re-creates the cookie). Demo-only — not something a real app would expose.

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
├── proxy.ts                           ← builds eval context (cookie, UA, locale) per request
├── server/visitor-id.ts               ← VISITOR_COOKIE constant (shared by proxy + reset)
├── confidence-helpers/                ← app-level decorators around withConfidence
│   ├── apply-base-context.ts
│   └── index.ts                       ← composed `withFlags` export
├── pages/
│   ├── _app.tsx                       ← <ConfidencePagesProvider> wrapper
│   ├── index.tsx                      ← reads base context for direct OpenFeature use
│   ├── promo.tsx                      ← contributes its own context attribute
│   └── api/
│       ├── confidence/apply.ts        ← one-line applyHandler() mount
│       └── visitor/reset.ts           ← demo-only cookie reset for the re-sample button
└── styles/                            ← Geist font + scoped CSS
```
