import { OpenFeature, type JsonValue } from "@openfeature/server-sdk";
import { useFlagDetails } from "@spotify-confidence/openfeature-server-provider-local/react-client";
import type { InferGetServerSidePropsType } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { readBaseContext, withFlags } from "@/confidence-helpers";
import styles from "@/styles/Home.module.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

type RedirectFlag = { enabled: false } | { enabled: true; url: string };

export const getServerSideProps = withFlags(async (ctx) => {
  const context = readBaseContext(ctx);

  // Direct OpenFeature resolve — fires exposure immediately. Useful for
  // server-side decisions like redirects where there's no client component to
  // read from a bundle.
  const client = OpenFeature.getClient();
  const redirect = await client.getObjectValue<RedirectFlag>(
    "main-page.redirect",
    { enabled: false },
    context
  );
  if (redirect.enabled) {
    return { redirect: { destination: redirect.url, permanent: false } };
  }

  return {
    props: { visitor_id: (context.visitor_id as string | undefined) ?? "" },
    // No `context` returned — the base context auto-merges into flag bundle
    // resolution thanks to applyBaseContext.
  };
});

export default function Home({
  visitor_id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [resampling, setResampling] = useState(false);
  const { value, reason, variant } = useFlagDetails<JsonValue>(
    "tutorial-feature",
    {}
  );

  async function resample() {
    setResampling(true);
    try {
      await fetch("/api/visitor/reset", { method: "POST" });
      await router.replace(router.asPath, undefined, { scroll: false });
    } finally {
      setResampling(false);
    }
  }

  return (
    <>
      <Head>
        <title>Confidence + Next.js Pages Router</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.demoMain}>
          <div className={styles.intro}>
            <p className={styles.subheading}>Confidence local resolver</p>
            <h1 className={styles.heading}>Next.js Pages Router demo</h1>
            <p className={styles.lead}>
              All flag evaluation happens on the server with effectively zero
              latency — the local resolver runs in-process, no per-evaluation
              network round-trip. Client components read the resolved values
              through familiar React hooks (<code>useFlag</code>,{" "}
              <code>useFlagDetails</code>) with no further configuration, and
              exposure is tracked automatically when a flag is first read.
            </p>
          </div>

          <div className={styles.flag}>
            <div className={styles.flagHeader}>
              <span>tutorial-feature</span>
            </div>
            <div className={styles.flagBody}>
              <div className={styles.meta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Variant</span>
                  <span className={styles.metaValue}>{variant ?? "(none)"}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Reason</span>
                  <span className={styles.metaValue}>{reason}</span>
                </div>
              </div>
              <pre className={styles.code}>{JSON.stringify(value, null, 2)}</pre>
            </div>
          </div>

          <div className={styles.visitor}>
            <span>
              Visitor: <span className={styles.visitorId}>{visitor_id.slice(0, 8) || "—"}…</span>
            </span>
            <button
              type="button"
              className={styles.button}
              onClick={resample}
              disabled={resampling}
            >
              {resampling ? "Re-sampling…" : "Re-sample variant"}
            </button>
          </div>

          <p className={styles.footnote}>
            The full targeting context (user-agent, locale, …) is built once
            per request in <code>proxy.ts</code> and forwarded as an{" "}
            <code>x-cf-context</code> header — only <code>visitor_id</code> is
            shipped to the client, since the rest is server-only targeting
            data. The same <code>getServerSideProps</code> also resolves a{" "}
            <code>main-page.redirect</code> object flag directly via{" "}
            <code>OpenFeature.getClient()</code>; if you configure that flag
            to return <code>{`{ enabled: true, url: ... }`}</code>, this page
            redirects server-side before reaching the React tree.
          </p>

          <Link href="/promo" className={styles.button}>
            See another example: page-scoped context →
          </Link>
        </main>
      </div>
    </>
  );
}
