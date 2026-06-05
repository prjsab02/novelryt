import { describe, it, expect } from 'vitest';
import { classifyStatus, parseKeys, rotateKeys } from './ai-key-pool';

describe('classifyStatus', () => {
  it('treats 429 and 5xx as rate-limited (retryable)', () => {
    expect(classifyStatus(429).rateLimited).toBe(true);
    expect(classifyStatus(503).rateLimited).toBe(true);
  });
  it('treats 400/401/403 as invalid key', () => {
    expect(classifyStatus(401).invalidKey).toBe(true);
    expect(classifyStatus(403).invalidKey).toBe(true);
  });
});

describe('parseKeys', () => {
  it('splits on commas and newlines, trims, de-dupes', () => {
    expect(parseKeys('a, b\nc , a')).toEqual(['a', 'b', 'c']);
  });
  it('returns empty for undefined/blank', () => {
    expect(parseKeys(undefined)).toEqual([]);
    expect(parseKeys('  ')).toEqual([]);
  });
});

describe('rotateKeys', () => {
  it('rotates the start index by seed', () => {
    expect(rotateKeys(['a', 'b', 'c'], 1)).toEqual(['b', 'c', 'a']);
    expect(rotateKeys(['a', 'b', 'c'], 3)).toEqual(['a', 'b', 'c']);
  });
  it('handles 0 or 1 key', () => {
    expect(rotateKeys([], 5)).toEqual([]);
    expect(rotateKeys(['only'], 5)).toEqual(['only']);
  });
});
