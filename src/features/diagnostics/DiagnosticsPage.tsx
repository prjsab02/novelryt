import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  runDiagnostics,
  MODE_LABELS,
  MODE_HINTS,
  type DiagnosticsMode,
} from './diagnostics-service';
import { Button, Card, EmptyState } from '@/components/ui';
import { cx } from '@/lib/utils';

const MODES: DiagnosticsMode[] = ['quick', 'standard', 'deep'];

export default function DiagnosticsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [mode, setMode] = useState<DiagnosticsMode>('standard');
  const [report, setReport] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    if (!projectId) return;
    setError('');
    setBusy(true);
    setReport('');
    try {
      setReport(await runDiagnostics(projectId, mode));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 text-2xl font-semibold">Story Doctor</h1>
      <p className="mb-4 text-sm text-slate-500">
        AI diagnostics for consistency, pacing, plot holes, and arcs. Findings are
        advisory — you stay in full creative control.
      </p>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cx(
                'rounded-md px-3 py-1.5 text-sm font-medium',
                mode === m
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
              )}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
          <Button className="ml-auto" onClick={run} disabled={busy}>
            {busy ? 'Analyzing…' : 'Run analysis'}
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-500">{MODE_HINTS[mode]}</p>
      </Card>

      {error && <p className="mb-4 text-sm text-rose-500">{error}</p>}

      {report ? (
        <Card>
          <article className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {report}
          </article>
        </Card>
      ) : (
        !busy && (
          <EmptyState
            title="No analysis yet"
            hint="Pick a depth and run an analysis of your manuscript."
          />
        )
      )}
    </div>
  );
}
