import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store';
import { Button, Card, Input, Label } from '@/components/ui';

export default function LoginPage() {
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const from = (location.state as { from?: string } | null)?.from ?? '/projects';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    await signIn(email, name);
    navigate(from, { replace: true });
  }

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
          <div>
            <Label>Display name (optional)</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pen name"
            />
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <Button type="submit" className="w-full">
            Continue
          </Button>
          <p className="text-center text-xs text-slate-400">
            Local-first mode. Your work stays on this device until cloud sync is
            configured.
          </p>
        </form>
      </Card>
    </div>
  );
}
