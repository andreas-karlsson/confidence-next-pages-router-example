import type { JsonValue } from "@openfeature/server-sdk";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";

const TARGETING_COOKIE = "cf_targeting_key";

export const getServerSideProps: GetServerSideProps<{
  targetingKey: string;
  tutorialFeature: JsonValue;
}> = async ({ req, res }) => {
  // Dynamic side-effect import: keeps the OpenFeature/Confidence code out of
  // the client bundle. The setup module's top-level await runs exactly once;
  // subsequent calls hit the module cache.
  await import("@/server/confidence-flags-setup");
  const { OpenFeature } = await import("@openfeature/server-sdk");
  const { randomUUID } = await import("node:crypto");

  let targetingKey = req.cookies[TARGETING_COOKIE];
  if (!targetingKey) {
    targetingKey = randomUUID();
    res.setHeader(
      "Set-Cookie",
      `${TARGETING_COOKIE}=${encodeURIComponent(targetingKey)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
    );
  }

  const client = OpenFeature.getClient();
  const context = { 'visitor_id': targetingKey };

  const tutorialFeature = await client.getObjectValue<JsonValue>(
    "tutorial-feature",
    {},
    context
  );

  return { props: { targetingKey, tutorialFeature } };
};

export default function Home({
  targetingKey,
  tutorialFeature,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Confidence + Next.js Pages Router</title>
      </Head>
      <main style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: 720 }}>
        <h1>Confidence local resolver — Pages Router demo</h1>
        <p>
          Flag resolved on the server in <code>getServerSideProps</code>.
        </p>
        <dl>
          <dt>targetingKey</dt>
          <dd><code>{targetingKey}</code></dd>
          <dt>tutorial-feature</dt>
          <dd>
            <pre style={{ background: "#f4f4f4", padding: "1rem" }}>
              {JSON.stringify(tutorialFeature, null, 2)}
            </pre>
          </dd>
        </dl>
      </main>
    </>
  );
}
