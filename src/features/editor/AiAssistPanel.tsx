import { useState } from 'react';
import { runWritingTool, TOOL_LABELS, type WritingTool } from '@/features/ai/tools';
import { Button } from '@/components/ui';

const TOOLS: WritingTool[] = ['rewrite', 'expand', 'condense', 'summarize', 'improve-dialogue'];

interface Props {
  /** Currently selected text in the editor (empty if none). */
  selection: string;
  /** Replace the current selection with `text`. */
  onReplace: (text: string) => void;
  /** Insert `text` after the selection / at cursor. */
  onInsert: (text: string) => void;
}

/**
 * Selection-based AI writing tools (Phase 7). Results are advisory: the writer
 * explicitly chooses Replace or Insert — AI never edits the manuscript silently
 * (PRD §79, §493).
 */
export default function AiAssistPanel({ selection, onReplace, onInsert }: Props) {
  const [busy, setBusy] = useState<WritingTool | null>(null);
  const [result, setResult] = useState('');
  const [activeTool, setActiveTool] = useState<WritingTool | null>(null);
  const [error, setError] = useState('');

  async function apply(tool: WritingTool) {
    setError('');
    setResult('');
    setActiveTool(tool);
    setBusy(tool);
    try {
      const out = await runWritingTool(tool, selection);
      setResult(out);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="border-t border-slate-200 p-3 text-sm dark:border-slate-800">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-slate-400">AI tools</span>
        {TOOLS.map((t) => (
          <Button
            key={t}
            variant="secondary"
            className="px-2 py-1 text-xs"
            disabled={!selection || !!busy}
            onClick={() => apply(t)}
          >
            {busy === t ? '…' : TOOL_LABELS[t]}
          </Button>
        ))}
        {!selection && (
          <span className="text-xs text-slate-400">Select text in the editor first.</span>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}

      {result && (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="mb-1 text-xs font-medium text-slate-500">
            {activeTool && TOOL_LABELS[activeTool]} suggestion
          </p>
          <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">{result}</p>
          <div className="mt-2 flex gap-2">
            <Button
              className="px-2 py-1 text-xs"
              onClick={() => {
                onReplace(result);
                setResult('');
              }}
            >
              Replace selection
            </Button>
            <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              onClick={() => {
                onInsert(result);
                setResult('');
              }}
            >
              Insert below
            </Button>
            <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setResult('')}>
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
