/**
 * Client-side AI caller (ADR 002). Posts to the Cloudflare Pages Function at
 * `/api/ai`, which holds all Gemini keys server-side. The browser never handles
 * a key. Token-conscious context shaping happens before this call (PRD §52).
 *
 * Dev note: `/api/ai` exists on the deployed Cloudflare site and under
 * `npx wrangler pages dev`. Plain `npm run dev` (Vite only) has no Functions, so
 * AI calls return a clear "not available" error during pure-frontend dev.
 */
export interface AIRequest {
  system?: string;
  prompt: string;
  temperature?: number;
}

export async function runAI(req: AIRequest): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
  } catch (e) {
    throw new Error(`Could not reach the AI service: ${(e as Error).message}`);
  }

  let data: { text?: string; error?: string } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    /* non-JSON (e.g. 404 in pure Vite dev) */
  }

  if (!res.ok) {
    throw new Error(
      data.error ??
        (res.status === 404
          ? 'AI service not available in this environment (run on Cloudflare or `wrangler pages dev`).'
          : `AI request failed (${res.status}).`),
    );
  }
  if (!data.text) throw new Error('Empty response from AI service.');
  return data.text;
}
