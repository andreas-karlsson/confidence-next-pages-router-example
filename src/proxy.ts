import { NextResponse, userAgent, type NextRequest } from "next/server";
import { VISITOR_COOKIE } from "@/server/visitor-id";

const ONE_YEAR_S = 60 * 60 * 24 * 365;
const CONTEXT_HEADER = "x-cf-context";

/**
 * Builds the OpenFeature evaluation context once per request and forwards it
 * to downstream handlers via a request header. Page `getServerSideProps`
 * functions read it back with `JSON.parse(req.headers['x-cf-context'])` and
 * pass it to `withConfidence`. The same proxy works for App Router during a
 * gradual migration — code there reads via `next/headers`.
 *
 * Also owns the `cf_visitor_id` cookie: assigns one if the request doesn't
 * carry it, so the targeting key is stable across navigations.
 */
export async function proxy(request: NextRequest) {
  // Visitor cookie management — generate if absent.
  const existing = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitor_id = existing ?? crypto.randomUUID();

  // Synchronous attributes parsed straight from the request.
  const ua = userAgent(request);
  const language = request.headers.get("accept-language")?.split(",")[0]?.trim();

  // Async enrichment via an external service. Demonstrates the pattern of
  // augmenting context from a backend lookup before flag evaluation.
  const localeContext = await fetchCountryInfo(language);

  const context = {
    visitor_id,
    browser: ua.browser.name,
    os: ua.os.name,
    device_type: ua.device.type ?? "desktop",
    language,
    ...localeContext,
  };

  const headers = new Headers(request.headers);
  headers.set(CONTEXT_HEADER, JSON.stringify(context));

  const response = NextResponse.next({ request: { headers } });
  if (!existing) {
    response.cookies.set(VISITOR_COOKIE, visitor_id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: ONE_YEAR_S,
    });
  }
  return response;
}

/**
 * Demo-only context enrichment: derives a country code from the
 * `Accept-Language` header and looks up region + timezone from the public
 * REST Countries API. In a real app this would be a call to one of your own
 * services that provides something you want in the base targeting context.
 */
async function fetchCountryInfo(language: string | undefined): Promise<{
  country?: string;
  region?: string;
  timezone?: string;
}> {
  const country = language?.match(/[a-z]{2,3}-([A-Z]{2})/i)?.[1]?.toUpperCase();
  if (!country) return {};

  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/alpha/${country}?fields=region,timezones`,
      { signal: AbortSignal.timeout(800) }
    );
    if (!res.ok) return { country };
    const data = (await res.json()) as { region?: string; timezones?: string[] };
    return { country, region: data.region, timezone: data.timezones?.[0] };
  } catch {
    // best-effort — fall through with just the country code
    return { country };
  }
}

export const config = {
  // Skip API routes and Next internals — the apply / reset endpoints don't
  // need a context, and re-running the proxy on /api/visitor/reset would
  // immediately re-create the cookie we're trying to clear.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
