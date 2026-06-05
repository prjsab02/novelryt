/**
 * Writing goals & stats (PRD §101–§102, §233–§243). Lightweight, device-local
 * progress tracking: we snapshot each project's total word count per day in
 * localStorage and derive "words today" and a writing streak. Deliberately not
 * synced — these are personal, ephemeral motivation metrics.
 */

export interface WritingStats {
  total: number;
  today: number;
  streak: number;
  /** Map of YYYY-MM-DD → end-of-day total word count. */
  byDay: Record<string, number>;
}

const PREFIX = 'novelryt.writinglog.';

export function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function load(projectId: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + projectId) ?? '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

function save(projectId: string, log: Record<string, number>): void {
  localStorage.setItem(PREFIX + projectId, JSON.stringify(log));
}

/** Record the project's current total word count against today. */
export function recordTotal(projectId: string, total: number): void {
  const log = load(projectId);
  log[todayKey()] = total;
  save(projectId, log);
}

/** Count of consecutive days up to and including today that have an entry. */
export function computeStreak(byDay: Record<string, number>, now: Date = new Date()): number {
  let streak = 0;
  const cursor = new Date(now);
  // Walk backwards day by day while a snapshot exists for that date.
  for (;;) {
    if (byDay[todayKey(cursor)] === undefined) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Words written today = today's total minus the most recent prior day's total. */
export function computeToday(byDay: Record<string, number>, now: Date = new Date()): number {
  const today = byDay[todayKey(now)];
  if (today === undefined) return 0;
  const priorDates = Object.keys(byDay)
    .filter((d) => d < todayKey(now))
    .sort();
  const prior = priorDates.length ? byDay[priorDates[priorDates.length - 1]] : 0;
  return Math.max(0, today - prior);
}

export function getStats(projectId: string, currentTotal: number): WritingStats {
  const byDay = load(projectId);
  // Ensure today reflects the latest known total even before an explicit save.
  if (byDay[todayKey()] === undefined || currentTotal > byDay[todayKey()]) {
    byDay[todayKey()] = currentTotal;
  }
  return {
    total: currentTotal,
    today: computeToday(byDay),
    streak: computeStreak(byDay),
    byDay,
  };
}
