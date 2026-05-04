import type { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end();
    return;
  }

  // Same dynamic-import trick as getServerSideProps: keeps the OpenFeature /
  // Confidence code (and async_hooks) out of any accidental client bundle.
  const { confidenceProvider } = await import("@/server/confidence-flags-setup");
  const { openResolveToken } = await import("@/server/confidence-token");

  const body = req.body as { handle?: unknown; flagName?: unknown } | undefined;
  if (
    !body ||
    typeof body.handle !== "string" ||
    typeof body.flagName !== "string"
  ) {
    res.status(400).end();
    return;
  }

  let resolveToken: string;
  try {
    resolveToken = openResolveToken(body.handle);
  } catch {
    res.status(400).end();
    return;
  }

  confidenceProvider.applyFlag(resolveToken, body.flagName);
  res.status(204).end();
};

export default handler;
