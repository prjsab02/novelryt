import { describe, it, expect } from 'vitest';
import { countWords } from './utils';

describe('countWords', () => {
  it('returns 0 for empty/whitespace', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n\t ')).toBe(0);
  });

  it('counts simple words', () => {
    expect(countWords('the quick brown fox')).toBe(4);
  });

  it('collapses repeated whitespace', () => {
    expect(countWords('one   two\n\nthree')).toBe(3);
  });

  it('ignores markdown punctuation tokens', () => {
    expect(countWords('# Heading\n\n**bold** text')).toBe(3);
  });
});
