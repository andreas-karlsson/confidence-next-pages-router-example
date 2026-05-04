import { randomUUID } from "node:crypto";
import type { GetServerSidePropsContext } from "next";
import { confidenceProvider } from "./confidence-flags-setup";
import { sealResolveToken } from "./confidence-token";

export const TARGETING_COOKIE = "cf_targeting_key";

type Req = GetServerSidePropsContext["req"];
type Res = GetServerSidePropsContext["res"];

type FlagBundle = Awaited<ReturnType<typeof confidenceProvider.resolve>>;

export interface ConfidencePageProps {
  bundle: FlagBundle;
  handle: string;
  targetingKey: string;
}

/**
 * Resolves Confidence flags for the current request without firing exposure
 * events. Pass the result through `props.confidence` from `getServerSideProps`;
 * the matching `_app.tsx` wrapper turns it into a `ConfidenceClientProvider`
 * the page's `useFlag` hooks can read from.
 */
export async function resolveConfidence(
  req: Req,
  res: Res,
  flags: string[] = []
): Promise<ConfidencePageProps> {
  let targetingKey = req.cookies[TARGETING_COOKIE];
  if (!targetingKey) {
    targetingKey = randomUUID();
    res.setHeader(
      "Set-Cookie",
      `${TARGETING_COOKIE}=${encodeURIComponent(targetingKey)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
    );
  }

  const context = { visitor_id: targetingKey };
  const bundle = await confidenceProvider.resolve(context, flags);

  // Strip the resolveToken before serializing into pageProps — it's
  // server-only. The client round-trips an opaque handle through the apply API.
  const handle = sealResolveToken(bundle.resolveToken);
  return {
    bundle: { ...bundle, resolveToken: "" },
    handle,
    targetingKey,
  };
}
