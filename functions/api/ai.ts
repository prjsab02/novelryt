/**
 * Cloudflare Pages Function — server-side AI proxy (ADR 002).
 * Route: POST /api/ai
 *
 * Holds ALL Gemini API keys server-side as an encrypted Cloudflare secret
 * (`GEMINI_API_KEYS`, comma/newline-separated). The browser never sees a key.
 * Implements multi-key rotation + failover per request. Free on Cloudflare's
 * Workers tier; satisfies the $0-infrastructure goal without client-side keys.
 *
 * Configure: Cloudflare → Pages project → Settings → Variables → add secret
 * `GEMINI_API_KEYS`. Optional `GEMINI_MODEL` (default gemini-1.5-flash).
 */
import { classifyStatus, parseKeys, rotateKeys } from '../../src/lib/ai-key-pool';

interface Env {
  GEMINI_API_KEYS?: string;
  GEMINI_MODEL?: string;
}

interface AIRequestBody {
  system?: string;
  prompt?: string;
  temperature?: number;
}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  const keys = parseKeys(env.GEMINI_API_KEYS);
  if (keys.length === 0) {
    return json(
      { error: 'AI is not configured. The site owner must set the GEMINI_API_KEYS secret.' },
      503,
    );
  }

  let body: AIRequestBody;
  try {
    body = (await request.json()) as AIRequestBody;
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }
  const prompt = (body.prompt ?? '').trim();
  if (!prompt) return json({ error: 'Missing prompt.' }, 400);

  const model = env.GEMINI_MODEL || 'gemini-1.5-flash';
  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    ...(body.system ? { systemInstruction: { parts: [{ text: body.system }] } } : {}),
    generationConfig: { temperature: body.temperature ?? 0.7 },
  };

  let lastError = 'unknown error';
  // Try keys in rotated order; fail over on rate-limit/5xx, skip invalid keys.
  const url = `${GEMINI_BASE}/${model}:generateContent`;
  for (const key of rotateKeys(keys)) {
    let res: Response;
    try {
      // Key passed as a header (not in the URL) — avoids leaking it into logs
      // and works across Gemini key formats (AIza… and AQ.… keys).
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      lastError = `network: ${(e as Error).message}`;
      continue; // try next key
    }

    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text =
        data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
      if (text) return json({ text });
      lastError = 'empty response';
      continue;
    }

    const detail = await res.text().catch(() => '');
    lastError = `${res.status}: ${detail.slice(0, 200)}`;
    const { invalidKey } = classifyStatus(res.status);
    // invalid key → skip; rate-limited/5xx → next key also fine.
    if (!invalidKey) {
      // transient; continue to next key
    }
  }

  return json({ error: `All AI keys failed. Last error: ${lastError}` }, 502);
};
