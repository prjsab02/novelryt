import { describe, it, expect } from 'vitest';
import { computeStreak, computeToday, todayKey } from './writing-stats';

function dayKey(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

describe('computeToday', () => {
  it('is total minus the most recent prior day', () => {
    const byDay = { [dayKey(-1)]: 1000, [dayKey(0)]: 1250 };
    expect(computeToday(byDay)).toBe(250);
  });
  it('uses 0 baseline when no prior day', () => {
    expect(computeToday({ [dayKey(0)]: 300 })).toBe(300);
  });
  it('never goes negative', () => {
    const byDay = { [dayKey(-1)]: 1000, [dayKey(0)]: 900 };
    expect(computeToday(byDay)).toBe(0);
  });
  it('is 0 with no entry today', () => {
    expect(computeToday({ [dayKey(-2)]: 500 })).toBe(0);
  });
});

describe('computeStreak', () => {
  it('counts consecutive days including today', () => {
    const byDay = { [dayKey(-2)]: 1, [dayKey(-1)]: 2, [dayKey(0)]: 3 };
    expect(computeStreak(byDay)).toBe(3);
  });
  it('breaks on a gap', () => {
    const byDay = { [dayKey(-3)]: 1, [dayKey(0)]: 3 };
    expect(computeStreak(byDay)).toBe(1);
  });
  it('is 0 when today has no entry', () => {
    expect(computeStreak({ [dayKey(-1)]: 1 })).toBe(0);
  });
});

describe('todayKey', () => {
  it('formats YYYY-MM-DD', () => {
    expect(todayKey(new Date('2026-06-06T10:00:00Z'))).toBe('2026-06-06');
  });
});
