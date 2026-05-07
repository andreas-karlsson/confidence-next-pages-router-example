import { type JsonValue } from "@openfeature/server-sdk";
import { useFlagDetails } from "@spotify-confidence/openfeature-server-provider-local/react-client";
import { Geist, Geist_Mono } from "next/font/google";
import Head from "next/head";
import Link from "next/link";
import { withFlags } from "@/confidence-helpers";
import styles from "@/styles/Home.module.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const getServerSideProps = withFlags(async () => {
  // This page contributes its own context attribute on top of the
  // proxy-derived base. The `applyBaseContext` decorator merges them, so a
  // flag rule could target visitors specifically while they're on a
  // promotional page (e.g. "show banner variant B to logged-in users on
  // promotional pages"). Note that this page never calls `readBaseContext`
  // — it doesn't need direct access to the base context for its own logic.
  return {
    props: {},
    context: { is_promotional_page: true },
  };
});

export default function Promo() {
  const { value, reason, variant } = useFlagDetails<JsonValue>(
    "tutorial-feature",
    {}
  );

  return (
    <>
      <Head>
        <title>Promo — Confidence + Pages Router</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.demoMain}>
          <div className={styles.intro}>
            <p className={styles.subheading}>Promo page</p>
            <h1 className={styles.heading}>Page-scoped context attribute</h1>
            <p className={styles.lead}>
              This page returns <code>{`{ is_promotional_page: true }`}</code>{" "}
              as its own context from <code>getServerSideProps</code>. The
              wrapper merges it onto the proxy-derived base, so flag rules can
              target visitors specifically when they're on a promotional page.
              No <code>readBaseContext</code> call here — this page doesn't
              need direct access to the base, just contributes to it.
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

          <Link href="/" className={styles.button}>
            ← Back to home
          </Link>
        </main>
      </div>
    </>
  );
}
