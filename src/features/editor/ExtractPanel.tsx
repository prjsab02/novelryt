import { useState } from 'react';
import { extractEntities, type Extraction } from '@/features/ai/extraction';
import { charactersRepo, locationsRepo } from '@/services/db/repositories';
import { Button, Card } from '@/components/ui';

interface Props {
  projectId: string;
  chapterContent: string;
  onClose: () => void;
}

type Row = { name: string; note: string; checked: boolean };

/**
 * Runs AI entity extraction on the current chapter and lets the writer approve
 * which suggestions to add to the Story Bible (PRD §79/§98 — nothing is added
 * automatically). De-dupes against existing entities by name.
 */
export default function ExtractPanel({ projectId, chapterContent, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [chars, setChars] = useState<Row[]>([]);
  const [locs, setLocs] = useState<Row[]>([]);
  const [ran, setRan] = useState(false);
  const [added, setAdded] = useState(0);

  async function run() {
    setError('');
    setBusy(true);
    try {
      const [existingChars, existingLocs] = await Promise.all([
        charactersRepo.byProject(projectId),
        locationsRepo.byProject(projectId),
      ]);
      const knownC = existingChars.map((c) => c.name.toLowerCase());
      const knownL = existingLocs.map((l) => l.name.toLowerCase());
      const result: Extraction = await extractEntities(
        chapterContent,
        existingChars.map((c) => c.name),
        existingLocs.map((l) => l.name),
      );
      setChars(
        result.characters
          .filter((e) => !knownC.includes(e.name.toLowerCase()))
          .map((e) => ({ ...e, checked: true })),
      );
      setLocs(
        result.locations
          .filter((e) => !knownL.includes(e.name.toLowerCase()))
          .map((e) => ({ ...e, checked: true })),
      );
      setRan(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function addSelected() {
    setBusy(true);
    let count = 0;
    for (const c of chars.filter((r) => r.checked)) {
      await charactersRepo.create({
        projectId,
        name: c.name,
        aliases: [],
        description: c.note,
        traits: '',
        goals: '',
        status: 'Active',
        tags: [],
      });
      count++;
    }
    for (const l of locs.filter((r) => r.checked)) {
      await locationsRepo.create({ projectId, name: l.name, type: '', description: l.note });
      count++;
    }
    setAdded(count);
    setBusy(false);
    setChars([]);
    setLocs([]);
  }

  function toggle(list: Row[], set: (r: Row[]) => void, i: number) {
    set(list.map((r, idx) => (idx === i ? { ...r, checked: !r.checked } : r)));
  }

  const nothingFound = ran && chars.length === 0 && locs.length === 0;
  const selectedCount = [...chars, ...locs].filter((r) => r.checked).length;

  return (
    <Card className="border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Find characters & places (AI)</h3>
        <button className="text-xs text-slate-400 hover:text-slate-600" onClick={onClose}>
          Close
        </button>
      </div>

      {!ran && (
        <div className="mt-2">
          <Button onClick={run} disabled={busy}>
            {busy ? 'Scanning…' : 'Scan this chapter'}
          </Button>
          <p className="mt-1 text-xs text-slate-400">
            Suggestions only — you choose what to add.
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
      {added > 0 && <p className="mt-2 text-xs text-emerald-500">Added {added} to Story Bible.</p>}
      {nothingFound && (
        <p className="mt-2 text-sm text-slate-500">No new characters or places found.</p>
      )}

      {(chars.length > 0 || locs.length > 0) && (
        <div className="mt-3 space-y-3">
          {chars.length > 0 && (
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">Characters</p>
              {chars.map((r, i) => (
                <label key={i} className="flex items-center gap-2 py-0.5 text-sm">
                  <input type="checkbox" checked={r.checked} onChange={() => toggle(chars, setChars, i)} />
                  <span className="font-medium">{r.name}</span>
                  {r.note && <span className="text-slate-400">— {r.note}</span>}
                </label>
              ))}
            </div>
          )}
          {locs.length > 0 && (
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">Locations</p>
              {locs.map((r, i) => (
                <label key={i} className="flex items-center gap-2 py-0.5 text-sm">
                  <input type="checkbox" checked={r.checked} onChange={() => toggle(locs, setLocs, i)} />
                  <span className="font-medium">{r.name}</span>
                  {r.note && <span className="text-slate-400">— {r.note}</span>}
                </label>
              ))}
            </div>
          )}
          <Button onClick={addSelected} disabled={busy || selectedCount === 0}>
            Add {selectedCount} to Story Bible
          </Button>
        </div>
      )}
    </Card>
  );
}
