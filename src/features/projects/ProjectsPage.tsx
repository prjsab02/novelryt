import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useProjectsStore } from './store';
import { useAuthStore } from '@/features/auth/store';
import { Button, Card, Input, Label, Select, Textarea, EmptyState } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { ProjectStatus } from '@/types';

const STATUSES: ProjectStatus[] = [
  'Planning',
  'Drafting',
  'Revising',
  'Editing',
  'Completed',
  'Archived',
];

export default function ProjectsPage() {
  const { projects, load, create, remove } = useProjectsStore();
  const user = useAuthStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !user) return;
    await create({
      title: title.trim(),
      description: description.trim(),
      genre: genre.trim(),
      status: 'Planning',
      ownerId: user.id,
    });
    setTitle('');
    setDescription('');
    setGenre('');
    setShowForm(false);
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New project'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Genre</Label>
                <Input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Fantasy" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button type="submit">Create project</Button>
          </form>
        </Card>
      )}

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" hint="Create your first novel to begin." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between">
                <Link to={`/projects/${p.id}`} className="group">
                  <h2 className="font-medium group-hover:text-indigo-500">{p.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {p.genre || 'Untitled genre'} · {p.status}
                  </p>
                </Link>
                <Select
                  className="w-auto"
                  value={p.status}
                  onChange={(e) =>
                    useProjectsStore.getState().update(p.id, {
                      status: e.target.value as ProjectStatus,
                    })
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              {p.description && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                  {p.description}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Updated {formatDate(p.updatedAt)}</span>
                <button
                  className="text-rose-500 hover:underline"
                  onClick={() => {
                    if (confirm(`Delete "${p.title}" and all its content?`)) void remove(p.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
