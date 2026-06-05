import { GeminiProvider, AIProviderError, type AIProvider, type AIRequest } from './provider';

/** Health states for a key in the pool (PRD §51, §270). */
type KeyState = 'active' | 'cooling' | 'invalid';

interface KeyHealth {
  key: string;
  state: KeyState;
  /** Epoch millis until which a cooling key is skipped. */
  cooldownUntil: number;
  failures: number;
}

const COOLDOWN_MS = 60_000;

/**
 * Central AI Gateway (ADR 002 / PRD §50). All AI requests route through here.
 * Owns the multi-key pool with round-robin selection, failover, and cooldown.
 * Provider-agnostic via the AIProvider interface.
 */
export class AIGateway {
  private pool: KeyHealth[] = [];
  private cursor = 0;

  constructor(private readonly provider: AIProvider = new GeminiProvider()) {}

  /** Replace the key pool (called from Settings). De-dupes and trims blanks. */
  setKeys(keys: string[]): void {
    const cleaned = Array.from(
      new Set(keys.map((k) => k.trim()).filter(Boolean)),
    );
    this.pool = cleaned.map((key) => ({
      key,
      state: 'active',
      cooldownUntil: 0,
      failures: 0,
    }));
    this.cursor = 0;
  }

  hasKeys(): boolean {
    return this.pool.some((k) => k.state !== 'invalid');
  }

  /** Snapshot of key health for the Settings/diagnostics UI (masked). */
  health(): { masked: string; state: KeyState; failures: number }[] {
    return this.pool.map((k) => ({
      masked: maskKey(k.key),
      state: k.state,
      failures: k.failures,
    }));
  }

  private nextAvailable(): KeyHealth | undefined {
    const n = this.pool.length;
    const ts = Date.now();
    for (let i = 0; i < n; i++) {
      const idx = (this.cursor + i) % n;
      const k = this.pool[idx];
      if (k.state === 'invalid') continue;
      if (k.state === 'cooling' && k.cooldownUntil > ts) continue;
      if (k.state === 'cooling') k.state = 'active';
      this.cursor = (idx + 1) % n;
      return k;
    }
    return undefined;
  }

  /**
   * Run a request, failing over across keys on rate-limit/transport errors.
   * Throws if no usable key exists or every key fails.
   */
  async run(req: AIRequest): Promise<string> {
    if (this.pool.length === 0) {
      throw new AIProviderError(
        'No AI keys configured. Add Gemini API keys in Settings.',
      );
    }

    let lastError: Error | undefined;
    // At most one full pass over the pool.
    for (let attempt = 0; attempt < this.pool.length; attempt++) {
      const candidate = this.nextAvailable();
      if (!candidate) break;
      try {
        return await this.provider.generate(candidate.key, req);
      } catch (e) {
        lastError = e as Error;
        if (e instanceof AIProviderError) {
          candidate.failures += 1;
          if (e.invalidKey) candidate.state = 'invalid';
          else if (e.rateLimited) {
            candidate.state = 'cooling';
            candidate.cooldownUntil = Date.now() + COOLDOWN_MS;
          }
        }
      }
    }
    throw new AIProviderError(
      `All AI keys failed. Last error: ${lastError?.message ?? 'unknown'}`,
    );
  }
}

function maskKey(key: string): string {
  if (key.length <= 8) return '••••';
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

/** Singleton gateway used across the app. */
export const aiGateway = new AIGateway();
