import { nanoid } from 'nanoid';

/** Generate a stable, URL-safe entity id. */
export const newId = (): string => nanoid(16);

/** Current epoch millis — single source for entity timestamps. */
export const now = (): number => Date.now();

/**
 * Count words in manuscript text. Treats runs of whitespace as separators and
 * ignores markdown-ish punctuation-only tokens. Deterministic; unit-tested.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  const matches = text
    .replace(/[#*_>`~-]+/g, ' ')
    .trim()
    .match(/\S+/g);
  return matches ? matches.length : 0;
}

/** Debounce a function by `wait` ms. Returns the wrapped fn with `.cancel()`. */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number,
): ((...args: A) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const wrapped = (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  wrapped.cancel = () => {
    if (timer) clearTimeout(timer);
  };
  return wrapped;
}

/** Join class names, dropping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Format an epoch-millis timestamp as a short localized date. */
export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
