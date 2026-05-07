import { withConfidence } from "@spotify-confidence/openfeature-server-provider-local/pages-router/server";
import { applyBaseContext } from "./apply-base-context";

export { readBaseContext } from "./apply-base-context";

/**
 * Type alias for `withConfidence` and any decorator that preserves its API.
 * Decorators in this folder are typed `(hoc: WithConfidenceHOC) => WithConfidenceHOC`.
 */
export type WithConfidenceHOC = typeof withConfidence;

/**
 * App-level `withConfidence` for this demo. Composes the decorators that
 * carry app-specific behavior on top of the lib's base HOC. Add new
 * decorators (e.g. `applyDebugLogging`) by extending this composition.
 */
export const withFlags: WithConfidenceHOC = applyBaseContext(withConfidence);
