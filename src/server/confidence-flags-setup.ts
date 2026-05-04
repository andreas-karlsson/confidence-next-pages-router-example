import { OpenFeature } from "@openfeature/server-sdk";
import { createConfidenceServerProvider } from "@spotify-confidence/openfeature-server-provider-local";

const flagClientSecret = process.env.CONFIDENCE_FLAG_CLIENT_SECRET;
if (!flagClientSecret) {
  throw new Error(
    "CONFIDENCE_FLAG_CLIENT_SECRET is not set. Add it to .env.local — see .env.local.example."
  );
}

export const confidenceProvider = createConfidenceServerProvider({
  flagClientSecret,
});

await OpenFeature.setProviderAndWait(confidenceProvider);
