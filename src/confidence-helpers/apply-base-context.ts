import type { EvaluationContext } from "@openfeature/server-sdk";
import type { GetServerSidePropsContext } from "next";
import type { WithConfidenceHOC } from "./index";

const CONTEXT_HEADER = "x-cf-context";

/**
 * Reads the base evaluation context that `proxy.ts` attached to the request
 * via the `x-cf-context` header. Use this from a page's `getServerSideProps`
 * when you need the parsed context for direct OpenFeature calls (e.g. a
 * server-side redirect that resolves a flag without going through the bundle
 * / hook flow).
 */
export function readBaseContext(
  ctx: GetServerSidePropsContext
): EvaluationContext {
  const raw = ctx.req.headers[CONTEXT_HEADER];
  return typeof raw === "string" ? JSON.parse(raw) : {};
}

/**
 * Decorator: makes the wrapped HOC auto-merge the proxy-attached base context
 * into whatever context the inner gSSP returns. Pages that omit `context`
 * resolve flags against the base alone; pages that return their own context
 * have it spread on top of the base (page attrs win on key conflicts).
 *
 * Inner gSSP API is unchanged — the base merge happens behind the scenes.
 */
export const applyBaseContext = (hoc: WithConfidenceHOC): WithConfidenceHOC =>
  ((inner, opts) =>
    hoc(async (ctx) => {
      const base = readBaseContext(ctx);
      const result = await inner(ctx);
      if (!("props" in result)) return result;
      return { ...result, context: { ...base, ...result.context } };
    }, opts)) as WithConfidenceHOC;
