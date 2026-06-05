import { describe, it, expect } from 'vitest';
import { detectChapters } from './import-service';

describe('detectChapters', () => {
  it('splits on markdown headings', () => {
    const text = '# One\nalpha\n\n# Two\nbeta';
    const chapters = detectChapters(text);
    expect(chapters.map((c) => c.title)).toEqual(['One', 'Two']);
    expect(chapters[0].content).toBe('alpha');
  });

  it('splits on "Chapter" lines', () => {
    const text = 'Chapter 1\nhello\nChapter 2\nworld';
    const chapters = detectChapters(text);
    expect(chapters).toHaveLength(2);
    expect(chapters[1].content).toBe('world');
  });

  it('falls back to a single chapter when no headings', () => {
    const chapters = detectChapters('just some prose\nmore prose');
    expect(chapters).toHaveLength(1);
    expect(chapters[0].title).toBe('Chapter 1');
  });
});
