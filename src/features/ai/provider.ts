/**
 * AIProvider abstraction (ADR 002 / PRD §392). Keeps the gateway independent of
 * any single vendor. The MVP implements Gemini via REST `fetch` (no SDK dep).
 */
export interface AIRequest {
  system?: string;
  prompt: string;
  temperature?: number;
}

export interface AIProvider {
  readonly name: string;
  /** Throws on transport / rate-limit errors so the gateway can fail over. */
  generate(apiKey: string, req: AIRequest): Promise<string>;
}

/** Error carrying whether the failure should trigger key failover/cooldown. */
export class AIProviderError extends Error {
  constructor(
    message: string,
    readonly rateLimited: boolean = false,
    readonly invalidKey: boolean = false,
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models';

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';

  constructor(private readonly model: string = GEMINI_MODEL) {}

  async generate(apiKey: string, req: AIRequest): Promise<string> {
    const url = `${GEMINI_BASE}/${this.model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const body = {
      contents: [{ role: 'user', parts: [{ text: req.prompt }] }],
      ...(req.system
        ? { systemInstruction: { parts: [{ text: req.system }] } }
        : {}),
      generationConfig: { temperature: req.temperature ?? 0.7 },
    };

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw new AIProviderError(`Network error: ${(e as Error).message}`, true);
    }

    if (!res.ok) {
      const rateLimited = res.status === 429 || res.status >= 500;
      const invalidKey = res.status === 400 || res.status === 401 || res.status === 403;
      const text = await res.text().catch(() => '');
      throw new AIProviderError(
        `Gemini ${res.status}: ${text.slice(0, 200)}`,
        rateLimited,
        invalidKey,
      );
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
    if (!text) throw new AIProviderError('Empty response from Gemini', false);
    return text;
  }
}
