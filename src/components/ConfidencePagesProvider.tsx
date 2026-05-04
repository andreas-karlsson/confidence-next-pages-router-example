import { ConfidenceClientProvider } from "@spotify-confidence/openfeature-server-provider-local/react-client";
import { useCallback, type ReactNode } from "react";
import type { ConfidencePageProps } from "@/server/confidence-resolve";

const APPLY_PATH = "/api/confidence/apply";

interface Props {
  pageProps: { confidence?: ConfidencePageProps };
  children: ReactNode;
}

/**
 * Reads `pageProps.confidence` (set by `resolveConfidence` in
 * `getServerSideProps`) and exposes the bundle to client `useFlag` hooks.
 * Pages that don't return a `confidence` key skip the wrap and any
 * `useFlag` calls in their tree return defaults.
 */
export function ConfidencePagesProvider({ pageProps, children }: Props) {
  const handle = pageProps.confidence?.handle;

  const apply = useCallback(
    async (flagName: string) => {
      if (!handle) return;
      await fetch(APPLY_PATH, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle, flagName }),
        keepalive: true,
      });
    },
    [handle]
  );

  if (!pageProps.confidence) return <>{children}</>;
  return (
    <ConfidenceClientProvider bundle={pageProps.confidence.bundle} apply={apply}>
      {children}
    </ConfidenceClientProvider>
  );
}
