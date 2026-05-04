import { ConfidenceClientProvider } from "@spotify-confidence/openfeature-server-provider-local/react-client";
import { useCallback, type ReactNode } from "react";
import { DEFAULT_APPLY_PATH } from "./constants";
import type { ConfidencePageProps } from "./types";

export type { ConfidencePageProps } from "./types";

interface Props {
  /**
   * The Confidence payload returned from `withConfidence` in
   * `getServerSideProps`, normally pulled out of `pageProps` in `_app.tsx`.
   * Pages that don't resolve flags pass `undefined` and any `useFlag` /
   * `useFlagDetails` calls in their tree return defaults.
   */
  confidence?: ConfidencePageProps;
  /** Override the apply API route. Must match where you mount `applyHandler`. */
  apiPath?: string;
  children: ReactNode;
}

/**
 * Place at the top of `_app.tsx`. Bridges the bundle resolved on the server
 * to the client `useFlag` / `useFlagDetails` hooks.
 */
export function ConfidencePagesProvider({
  confidence,
  apiPath = DEFAULT_APPLY_PATH,
  children,
}: Props) {
  const resolveToken = confidence?.resolveToken;

  const apply = useCallback(
    async (flagName: string) => {
      if (!resolveToken) return;
      await fetch(apiPath, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resolveToken, flagName }),
        keepalive: true,
      });
    },
    [resolveToken, apiPath]
  );

  if (!confidence) return <>{children}</>;
  return (
    <ConfidenceClientProvider bundle={confidence} apply={apply}>
      {children}
    </ConfidenceClientProvider>
  );
}
