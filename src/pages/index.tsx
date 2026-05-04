import { OpenFeature, type JsonValue } from "@openfeature/server-sdk";
import { useFlagDetails } from "@spotify-confidence/openfeature-server-provider-local/react-client";
import type { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { withConfidence } from "@/lib/confidence-pages-router/server";
import { getOrSetVisitorId } from "@/server/visitor-id";

export const getServerSideProps = withConfidence(
  {
    context: ({ req, res }) => ({ visitor_id: getOrSetVisitorId(req, res) }),
  },
  async ({ req, res }) => {
    // Direct OpenFeature resolve — fires exposure immediately. Coexists with
    // the bundle path resolved by withConfidence below; both go through the
    // same provider registered in instrumentation.ts.
    const client = OpenFeature.getClient();
    const directValue = await client.getObjectValue<JsonValue>(
      "tutorial-feature",
      {},
      { visitor_id: getOrSetVisitorId(req, res) }
    );
    return { props: { directValue } };
  }
);

export default function Home({
  directValue,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { value: hookValue, reason, variant } = useFlagDetails<JsonValue>(
    "tutorial-feature",
    {}
  );

  return (
    <>
      <Head>
        <title>Confidence + Next.js Pages Router</title>
      </Head>
      <main style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: 720 }}>
        <h1>Confidence local resolver — Pages Router demo</h1>
        <p>
          Same flag, two resolution paths, same request. The provider is
          registered once in <code>instrumentation.ts</code>; both paths read
          from it.
        </p>

        <h2>Hook path</h2>
        <p>
          <code>withConfidence</code> resolves the bundle in{" "}
          <code>getServerSideProps</code> without firing exposure;{" "}
          <code>useFlagDetails</code> reads the value and POSTs to{" "}
          <code>/api/confidence/apply</code> on mount.
        </p>
        <dl>
          <dt>tutorial-feature</dt>
          <dd>
            <pre style={{ background: "#f4f4f4", padding: "1rem" }}>
              {JSON.stringify(hookValue, null, 2)}
            </pre>
          </dd>
          <dt>variant</dt>
          <dd><code>{variant ?? "(none)"}</code></dd>
          <dt>reason</dt>
          <dd><code>{reason}</code></dd>
        </dl>

        <h2>Direct OpenFeature path</h2>
        <p>
          <code>OpenFeature.getClient().getObjectValue(...)</code> in the inner{" "}
          <code>getServerSideProps</code> — server-side only, fires exposure
          eagerly. No client hook involvement.
        </p>
        <dl>
          <dt>tutorial-feature</dt>
          <dd>
            <pre style={{ background: "#f4f4f4", padding: "1rem" }}>
              {JSON.stringify(directValue, null, 2)}
            </pre>
          </dd>
        </dl>
      </main>
    </>
  );
}
