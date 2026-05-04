import { randomUUID } from "node:crypto";
import type { GetServerSidePropsContext } from "next";

const COOKIE_NAME = "cf_visitor_id";
const ONE_YEAR_S = 60 * 60 * 24 * 365;

type Req = GetServerSidePropsContext["req"];
type Res = GetServerSidePropsContext["res"];

/**
 * Demo-only stable per-visitor identifier. Replace with your real identity
 * source (auth user id, analytics SDK, etc.) — Confidence doesn't care where
 * the targeting key comes from, only that it's stable per visitor.
 */
export function getOrSetVisitorId(req: Req, res: Res): string {
  const existing = req.cookies[COOKIE_NAME];
  if (existing) return existing;
  const value = randomUUID();
  // Make the helper idempotent within a single request: mutate req.cookies so
  // a second call (e.g. from withConfidence's context callback after the inner
  // gSSP already ran) reads the same id we just generated.
  req.cookies[COOKIE_NAME] = value;
  res.appendHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_YEAR_S}`
  );
  return value;
}
