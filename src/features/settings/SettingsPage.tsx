import { useSettingsStore } from './store';
import { Button, Card } from '@/components/ui';

export default function SettingsPage() {
  const { theme, setTheme } = useSettingsStore();

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
        <h2 className="font-medium">AI</h2>
        <p className="mt-1 text-sm text-slate-500">
          AI runs through a secure server-side proxy — there's nothing to configure
          here. The site owner manages the Gemini keys in the hosting environment.
        </p>
      </Card>
    </div>
  );
}
