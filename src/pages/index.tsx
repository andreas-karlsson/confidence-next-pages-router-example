import type { JsonValue } from "@openfeature/server-sdk";
import { useFlagDetails } from "@spotify-confidence/openfeature-server-provider-local/react-client";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import type { ConfidencePageProps } from "@/server/confidence-resolve";

export const getServerSideProps: GetServerSideProps<{
  confidence: ConfidencePageProps;
}> = async ({ req, res }) => {
  const { resolveConfidence } = await import("@/server/confidence-resolve");
  return { props: { confidence: await resolveConfidence(req, res) } };
};

export default function Home(
  _props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { value, reason, variant } = useFlagDetails<JsonValue>(
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
          Flag bundle resolved on the server in{" "}
          <code>getServerSideProps</code>; <code>useFlagDetails</code> reads
          from the bundle and fires exposure via{" "}
          <code>/api/confidence/apply</code> on mount.
        </p>
        <dl>
          <dt>tutorial-feature.value</dt>
          <dd>
            <pre style={{ background: "#f4f4f4", padding: "1rem" }}>
              {JSON.stringify(value, null, 2)}
            </pre>
          </dd>
          <dt>variant</dt>
          <dd><code>{variant ?? "(none)"}</code></dd>
          <dt>reason</dt>
          <dd><code>{reason}</code></dd>
        </dl>
      </main>
    </>
  );
}
