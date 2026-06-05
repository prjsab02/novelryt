import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useEditorStore } from './store';
import { Button, Input, EmptyState } from '@/components/ui';
import { countWords, debounce, cx } from '@/lib/utils';
import AiAssistPanel from './AiAssistPanel';

type SaveState = 'saved' | 'saving' | 'idle';

export default function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { chapters, load, createChapter, renameChapter, saveContent, removeChapter, reorder } =
    useEditorStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (projectId) void load(projectId);
  }, [projectId, load]);

  const active = useMemo(
    () => chapters.find((c) => c.id === activeId) ?? null,
    [chapters, activeId],
  );

  // Select first chapter when none active.
  useEffect(() => {
    if (!activeId && chapters.length) {
      setActiveId(chapters[0].id);
    }
  }, [chapters, activeId]);

  // Load draft when the active chapter changes.
  useEffect(() => {
    if (active) {
      setDraft(active.content);
      setSaveState('saved');
    }
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced autosave (PRD §91, §382). Recreated per active chapter id.
  const debouncedSave = useMemo(
    () =>
      debounce((id: string, content: string) => {
        void saveContent(id, content).then(() => setSaveState('saved'));
      }, 800),
    [saveContent],
  );

  useEffect(() => () => debouncedSave.cancel(), [debouncedSave]);

  const onChange = useCallback(
    (value: string) => {
      setDraft(value);
      if (active) {
        setSaveState('saving');
        debouncedSave(active.id, value);
      }
    },
    [active, debouncedSave],
  );

  async function handleNewChapter() {
    const ch = await createChapter('');
    setActiveId(ch.id);
  }

  function syncSelection() {
    const el = textareaRef.current;
    if (el) setSelection({ start: el.selectionStart, end: el.selectionEnd });
  }

  const selectedText = draft.slice(selection.start, selection.end);

  // Replace the current selection (or insert at cursor) with AI output, then save.
  function applyText(text: string, mode: 'replace' | 'insert') {
    const { start, end } = selection;
    const next =
      mode === 'replace'
        ? draft.slice(0, start) + text + draft.slice(end)
        : draft.slice(0, end) + '\n\n' + text + draft.slice(end);
    onChange(next);
  }

  const liveWordCount = countWords(draft);

  return (
    <div className="flex h-full">
      {/* Chapter list */}
      <aside className="w-64 shrink-0 overflow-y-auto border-r border-slate-200 p-3 dark:border-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Chapters
          </h2>
          <Button variant="ghost" onClick={handleNewChapter} aria-label="New chapter">
            +
          </Button>
        </div>
        <ul className="space-y-1">
          {chapters.map((c, i) => (
            <li key={c.id}>
              <div
                className={cx(
                  'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm',
                  c.id === activeId
                    ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                )}
              >
                <button className="flex-1 truncate text-left" onClick={() => setActiveId(c.id)}>
                  {c.title}
                  <span className="ml-1 text-xs text-slate-400">{c.wordCount}w</span>
                </button>
                <div className="hidden gap-0.5 group-hover:flex">
                  <button
                    className="px-1 text-slate-400 hover:text-slate-700"
                    onClick={() => reorder(c.id, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="px-1 text-slate-400 hover:text-slate-700"
                    onClick={() => reorder(c.id, 1)}
                    disabled={i === chapters.length - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    className="px-1 text-rose-400 hover:text-rose-600"
                    onClick={() => {
                      if (confirm(`Delete "${c.title}"?`)) {
                        void removeChapter(c.id);
                        if (activeId === c.id) setActiveId(null);
                      }
                    }}
                    aria-label="Delete chapter"
                  >
                    ×
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {chapters.length === 0 && (
          <p className="mt-2 text-xs text-slate-400">No chapters yet. Click + to add one.</p>
        )}
      </aside>

      {/* Editor */}
      <section className="flex flex-1 flex-col">
        {active ? (
          <>
            <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-3 dark:border-slate-800">
              <Input
                className="max-w-md border-none text-lg font-semibold focus:ring-0"
                value={active.title}
                onChange={(e) => renameChapter(active.id, e.target.value)}
              />
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>{liveWordCount} words</span>
                <span>
                  {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : ''}
                </span>
              </div>
            </header>
            <textarea
              ref={textareaRef}
              className="manuscript flex-1 resize-none bg-transparent p-6 focus:outline-none"
              value={draft}
              onChange={(e) => onChange(e.target.value)}
              onSelect={syncSelection}
              onKeyUp={syncSelection}
              onMouseUp={syncSelection}
              placeholder="Begin writing…"
              spellCheck
            />
            <AiAssistPanel
              selection={selectedText}
              onReplace={(t) => applyText(t, 'replace')}
              onInsert={(t) => applyText(t, 'insert')}
            />
          </>
        ) : (
          <div className="p-6">
            <EmptyState title="No chapter selected" hint="Create or pick a chapter to write." />
          </div>
        )}
      </section>
    </div>
  );
}
