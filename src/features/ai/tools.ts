import { runAI } from './client';

/**
 * AI writing tools (PRD §57–§61, Phase 7). Each tool transforms a piece of text
 * via the gateway and returns a suggestion. Per PRD §79 / §493 these NEVER mutate
 * the manuscript directly — the UI presents the result for the writer to accept.
 */
export type WritingTool = 'rewrite' | 'expand' | 'condense' | 'summarize' | 'improve-dialogue';

const SYSTEM =
  'You are NovelRyt Writing Assistant. You transform prose on request and return ' +
  'ONLY the transformed text — no preamble, no quotes, no commentary. Preserve the ' +
  "author's voice, tense, and point of view.";

const INSTRUCTIONS: Record<WritingTool, string> = {
  rewrite: 'Rewrite the following passage to improve clarity and flow while preserving meaning:',
  expand: 'Expand the following passage with vivid, consistent detail, keeping the same intent:',
  condense: 'Condense the following passage to be tighter and more concise without losing key meaning:',
  summarize: 'Summarize the following passage in 2–4 sentences:',
  'improve-dialogue': 'Improve the dialogue in the following passage to sound natural and distinct per character:',
};

export const TOOL_LABELS: Record<WritingTool, string> = {
  rewrite: 'Rewrite',
  expand: 'Expand',
  condense: 'Condense',
  summarize: 'Summarize',
  'improve-dialogue': 'Improve dialogue',
};

export async function runWritingTool(tool: WritingTool, text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Select some text first.');
  const prompt = `${INSTRUCTIONS[tool]}\n\n"""\n${trimmed.slice(0, 6000)}\n"""`;
  const result = await runAI({ system: SYSTEM, prompt, temperature: 0.7 });
  return result.trim();
}
