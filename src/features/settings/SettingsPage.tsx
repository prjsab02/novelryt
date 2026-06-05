import { useState } from 'react';
import { useSettingsStore } from './store';
import { aiGateway } from '@/features/ai/gateway';
import { Button, Card, Label, Textarea } from '@/components/ui';

export default function SettingsPage() {
  const { apiKeys, setApiKeys, theme, setTheme } = useSettingsStore();
  const [text, setText] = useState(apiKeys.join('\n'));
  const [saved, setSaved] = useState(false);

  function save() {
    setApiKeys(text.split('\n'));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const health = aiGateway.health();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Settings</h1>

      <Card className="mb-6">
        <h2 className="font-medium">Appearance</h2>
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant={theme === 'light' ? 'primary' : 'secondary'}
            onClick={() => setTheme('light')}
          >
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            onClick={() => setTheme('dark')}
          >
            Dark
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-medium">AI — Gemini API keys</h2>
        <p className="mt-1 text-sm text-slate-500">
          One key per line. Keys are stored locally on this device and used in
          rotation with automatic failover. They never leave your browser except
          to call Gemini directly.
        </p>
        <div className="mt-3">
          <Label>API keys</Label>
          <Textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'AIza...key1\nAIza...key2'}
            spellCheck={false}
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={save}>Save keys</Button>
          {saved && <span className="text-sm text-emerald-500">Saved</span>}
        </div>

        {health.length > 0 && (
          <div className="mt-4">
            <Label>Key pool health</Label>
            <ul className="space-y-1 text-sm">
              {health.map((k, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="font-mono">{k.masked}</span>
                  <span className="text-slate-400">
                    {k.state} · {k.failures} failures
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
