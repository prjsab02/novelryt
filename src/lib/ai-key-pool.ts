/**
 * Pure, transport-agnostic multi-key pool helpers (ADR 002). Shared by the
 * Cloudflare Pages Function (`functions/api/ai.ts`) and unit tests. No DOM, no
 * fetch, no imports — so it bundles cleanly into the Workers runtime.
 *
 * The AI proxy is stateless per request, so cross-request cooldown isn't
 * tracked; instead we rotate the start index to spread load across keys and
 * fail over within a single request.
 */

export interface FailureKind {
  /** Transient — try the next key (429 / 5xx / network). */
  rateLimited: boolean;
  /** Permanent for this key — skip it (400 / 401 / 403). */
  invalidKey: boolean;
}

/** Classify an HTTP status from the provider into a failover decision. */
export function classifyStatus(status: number): FailureKind {
  return {
    rateLimited: status === 429 || status >= 500,
    invalidKey: status === 400 || status === 401 || status === 403,
  };
}

/** Parse a comma/newline-separated key string into a de-duped, trimmed list. */
export function parseKeys(raw: string | undefined): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(/[,\n]/)
        .map((k) => k.trim())
        .filter(Boolean),
    ),
  );
}

/**
 * Return the keys in the order they should be tried, starting at a rotated
 * index so concurrent requests don't all hammer the first key.
 */
export function rotateKeys(keys: string[], seed: number = Date.now()): string[] {
  if (keys.length <= 1) return [...keys];
  const start = ((seed % keys.length) + keys.length) % keys.length;
  return [...keys.slice(start), ...keys.slice(0, start)];
}
