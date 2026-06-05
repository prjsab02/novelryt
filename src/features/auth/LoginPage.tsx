import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store';
import { Button, Card } from '@/components/ui';

export default function LoginPage() {
  const { mode, signInLocal, signInGoogle } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/projects';

  async function go(action: () => Promise<void>) {
    setError('');
    setBusy(true);
    try {
      await action();
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <Card className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold">NovelRyt</h1>
        <p className="mt-1 text-sm text-slate-500">
          Write stories. Let AI manage everything else.
        </p>

        {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}

        {mode === 'firebase' ? (
          <Button
            className="mt-6 w-full"
            disabled={busy}
            onClick={() => go(signInGoogle)}
          >
            {busy ? 'Please wait…' : 'Continue with Google'}
          </Button>
        ) : (
          <Button
            className="mt-6 w-full"
            disabled={busy}
            onClick={() => go(() => signInLocal())}
          >
            {busy ? 'Please wait…' : 'Start writing (offline)'}
          </Button>
        )}

        <p className="mt-4 text-xs text-slate-400">
          {mode === 'firebase'
            ? 'Your work syncs securely across your devices.'
            : 'Local-first mode. Your work stays on this device until cloud sync is configured.'}
        </p>
      </Card>
    </div>
  );
}
