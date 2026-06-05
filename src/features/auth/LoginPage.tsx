import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store';
import { Button, Card, Input, Label } from '@/components/ui';

export default function LoginPage() {
  const { mode, signInLocal, signInEmail, signUpEmail, signInGoogle } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/projects';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'local') {
        await signInLocal(email, name);
      } else if (isSignUp) {
        await signUpEmail(email, password, name);
      } else {
        await signInEmail(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setBusy(true);
    try {
      await signInGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const firebase = mode === 'firebase';

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">NovelRyt</h1>
        <p className="mt-1 text-sm text-slate-500">
          Write stories. Let AI manage everything else.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
            />
          </div>
          {firebase && (
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}
          {(!firebase || isSignUp) && (
            <div>
              <Label>Display name (optional)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pen name" />
            </div>
          )}
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Please wait…' : firebase ? (isSignUp ? 'Create account' : 'Sign in') : 'Continue'}
          </Button>
        </form>

        {firebase && (
          <>
            <button
              className="mt-3 w-full text-center text-xs text-indigo-500 hover:underline"
              onClick={() => setIsSignUp((v) => !v)}
            >
              {isSignUp ? 'Have an account? Sign in' : 'New here? Create an account'}
            </button>
            <div className="my-3 text-center text-xs text-slate-400">or</div>
            <Button variant="secondary" className="w-full" onClick={handleGoogle} disabled={busy}>
              Continue with Google
            </Button>
          </>
        )}

        <p className="mt-4 text-center text-xs text-slate-400">
          {firebase
            ? 'Your work syncs securely across your devices.'
            : 'Local-first mode. Your work stays on this device until cloud sync is configured.'}
        </p>
      </Card>
    </div>
  );
}
