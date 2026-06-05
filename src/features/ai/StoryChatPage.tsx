import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { runAI } from './client';
import { buildStoryContext } from './context-builder';
import { projectsRepo } from '@/services/db/repositories';
import { Button, Textarea, EmptyState } from '@/components/ui';
import { newId, now, cx } from '@/lib/utils';
import type { ChatMessage } from '@/types';

const SYSTEM_PROMPT =
  'You are NovelRyt Story Chat, a project-aware writing assistant. Use the ' +
  'provided story context. Be concise and concrete. You advise and suggest; ' +
  'you never claim to have changed the manuscript. Surface uncertainty plainly.';

export default function StoryChatPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || !projectId || busy) return;
    setError('');

    const userMsg: ChatMessage = {
      id: newId(),
      role: 'user',
      content: text,
      createdAt: now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setBusy(true);

    try {
      const project = await projectsRepo.get(projectId);
      const context = await buildStoryContext({
        projectId,
        projectTitle: project?.title ?? 'Untitled',
      });
      const prompt = `Story context:\n${context}\n\nWriter: ${text}`;
      const reply = await runAI({ system: SYSTEM_PROMPT, prompt });
      setMessages((m) => [
        ...m,
        { id: newId(), role: 'assistant', content: reply, createdAt: now() },
      ]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-6">
      <h1 className="mb-2 text-2xl font-semibold">Story Chat</h1>
      <p className="mb-4 text-sm text-slate-500">
        Project-aware AI. It sees your characters, locations, and context — never
        your full manuscript.
      </p>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {messages.length === 0 && (
          <EmptyState
            title="Ask about your story"
            hint="e.g. “Suggest a plot twist for chapter 3” or “Analyze my protagonist.”"
          />
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cx(
              'rounded-lg px-4 py-2 text-sm',
              m.role === 'user'
                ? 'ml-auto max-w-[80%] bg-indigo-600 text-white'
                : 'mr-auto max-w-[90%] bg-slate-100 dark:bg-slate-800',
            )}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {busy && <p className="text-sm text-slate-400">Thinking…</p>}
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div ref={endRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <Textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void send();
          }}
          placeholder="Ask about your story…  (Ctrl/Cmd+Enter to send)"
        />
        <Button onClick={send} disabled={busy}>
          Send
        </Button>
      </div>
    </div>
  );
}
