import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ConfidencePagesProvider } from "@/components/ConfidencePagesProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfidencePagesProvider pageProps={pageProps}>
      <Component {...pageProps} />
    </ConfidencePagesProvider>
  );
}
