import type { createConfidenceServerProvider } from "@spotify-confidence/openfeature-server-provider-local";

export type ConfidenceProvider = ReturnType<typeof createConfidenceServerProvider>;

export type FlagBundle = Awaited<ReturnType<ConfidenceProvider["resolve"]>>;

/**
 * Server-to-client transport payload returned from `withConfidence` and
 * consumed by `<ConfidencePagesProvider>`. Structurally a `FlagBundle` whose
 * `resolveToken` has been sealed (AES-GCM) — the apply API route is the only
 * thing that opens it.
 */
export type ConfidencePageProps = FlagBundle;
