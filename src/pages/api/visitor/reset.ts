import type { NextApiHandler } from "next";
import { VISITOR_COOKIE } from "@/server/visitor-id";

// Demo-only: clears the visitor cookie so the next request gets a fresh
// targeting key and (potentially) a different flag variant. A real app
// wouldn't expose this — replace the visitor id source with your auth /
// analytics identifier instead.
const handler: NextApiHandler = (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end();
    return;
  }
  res.appendHeader(
    "Set-Cookie",
    `${VISITOR_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
  res.status(204).end();
};

export default handler;
