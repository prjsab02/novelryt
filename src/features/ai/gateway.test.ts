import { describe, it, expect, vi } from 'vitest';
import { AIGateway } from './gateway';
import { AIProviderError, type AIProvider } from './provider';

function fakeProvider(impl: AIProvider['generate']): AIProvider {
  return { name: 'fake', generate: impl };
}

describe('AIGateway', () => {
  it('throws when no keys configured', async () => {
    const gw = new AIGateway(fakeProvider(async () => 'x'));
    await expect(gw.run({ prompt: 'hi' })).rejects.toThrow(/No AI keys/);
  });

  it('returns provider output on success', async () => {
    const gw = new AIGateway(fakeProvider(async () => 'hello'));
    gw.setKeys(['k1']);
    await expect(gw.run({ prompt: 'hi' })).resolves.toBe('hello');
  });

  it('fails over to the next key on rate limit', async () => {
    const gen = vi
      .fn<AIProvider['generate']>()
      .mockRejectedValueOnce(new AIProviderError('429', true))
      .mockResolvedValueOnce('second');
    const gw = new AIGateway(fakeProvider(gen));
    gw.setKeys(['k1', 'k2']);
    await expect(gw.run({ prompt: 'hi' })).resolves.toBe('second');
    expect(gen).toHaveBeenCalledTimes(2);
  });

  it('marks invalid keys and stops using them', async () => {
    const gw = new AIGateway(
      fakeProvider(async () => {
        throw new AIProviderError('bad key', false, true);
      }),
    );
    gw.setKeys(['k1']);
    await expect(gw.run({ prompt: 'hi' })).rejects.toThrow(/All AI keys failed/);
    expect(gw.hasKeys()).toBe(false);
  });

  it('de-dupes and trims keys', () => {
    const gw = new AIGateway(fakeProvider(async () => 'x'));
    gw.setKeys([' k1 ', 'k1', '', 'k2']);
    expect(gw.health()).toHaveLength(2);
  });
});
