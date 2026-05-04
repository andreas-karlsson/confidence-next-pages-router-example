import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ConfidencePagesProvider } from "@/lib/confidence-pages-router/client";

export default function App({ Component, pageProps }: AppProps) {
  const { confidence, ...rest } = pageProps;
  return (
    <ConfidencePagesProvider confidence={confidence}>
      <Component {...rest} />
    </ConfidencePagesProvider>
  );
}
