/**
 * Next.js calls `register()` once when the server boots (and never during
 * `next build`). That's the right place to wire up the OpenFeature provider:
 * the lib reads it via `OpenFeature.getProvider()` at request time, so it
 * must already be registered by then.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { OpenFeature } = await import("@openfeature/server-sdk");
  const { createConfidenceServerProvider } = await import(
    "@spotify-confidence/openfeature-server-provider-local"
  );

  const flagClientSecret = process.env.CONFIDENCE_FLAG_CLIENT_SECRET;
  if (!flagClientSecret) {
    throw new Error(
      "CONFIDENCE_FLAG_CLIENT_SECRET is not set. Add it to .env.local — see .env.local.example."
    );
  }

  const provider = createConfidenceServerProvider({ flagClientSecret });
  await OpenFeature.setProviderAndWait(provider);
}
