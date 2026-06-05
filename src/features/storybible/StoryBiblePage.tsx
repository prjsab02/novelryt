import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStoryBibleStore } from './store';
import { Button, Card, Input, Textarea, Select, Label, EmptyState } from '@/components/ui';
import { cx } from '@/lib/utils';
import type { CharacterStatus } from '@/types';

type Tab = 'characters' | 'locations' | 'notes';
const TABS: Tab[] = ['characters', 'locations', 'notes'];
const CHAR_STATUSES: CharacterStatus[] = ['Active', 'Deceased', 'Missing', 'Retired'];

export default function StoryBiblePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const store = useStoryBibleStore();
  const [tab, setTab] = useState<Tab>('characters');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (projectId) void store.load(projectId);
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  function add() {
    const name = newName.trim();
    if (tab === 'characters') void store.addCharacter(name);
    else if (tab === 'locations') void store.addLocation(name);
    else void store.addNote(name);
    setNewName('');
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Story Bible</h1>

      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cx(
              'rounded-md px-3 py-1.5 text-sm font-medium capitalize',
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mb-4 flex gap-2">
        <Input
          placeholder={`Add ${tab.slice(0, -1)}…`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <Button onClick={add}>Add</Button>
      </div>

      {tab === 'characters' && (
        <div className="space-y-3">
          {store.characters.length === 0 && (
            <EmptyState title="No characters yet" hint="Add your cast above." />
          )}
          {store.characters.map((c) => (
            <Card key={c.id}>
              <div className="flex items-center justify-between gap-2">
                <Input
                  className="font-medium"
                  value={c.name}
                  onChange={(e) => store.updateCharacter(c.id, { name: e.target.value })}
                />
                <Select
                  className="w-auto"
                  value={c.status}
                  onChange={(e) =>
                    store.updateCharacter(c.id, { status: e.target.value as CharacterStatus })
                  }
                >
                  {CHAR_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
                <button
                  className="text-rose-500 hover:underline"
                  onClick={() => store.removeCharacter(c.id)}
                >
                  Delete
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Traits</Label>
                  <Input
                    value={c.traits}
                    onChange={(e) => store.updateCharacter(c.id, { traits: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Goals</Label>
                  <Input
                    value={c.goals}
                    onChange={(e) => store.updateCharacter(c.id, { goals: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={c.description}
                  onChange={(e) => store.updateCharacter(c.id, { description: e.target.value })}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'locations' && (
        <div className="space-y-3">
          {store.locations.length === 0 && (
            <EmptyState title="No locations yet" hint="Add places above." />
          )}
          {store.locations.map((l) => (
            <Card key={l.id}>
              <div className="flex items-center justify-between gap-2">
                <Input
                  className="font-medium"
                  value={l.name}
                  onChange={(e) => store.updateLocation(l.id, { name: e.target.value })}
                />
                <Input
                  className="max-w-[10rem]"
                  placeholder="Type (city, kingdom…)"
                  value={l.type}
                  onChange={(e) => store.updateLocation(l.id, { type: e.target.value })}
                />
                <button
                  className="text-rose-500 hover:underline"
                  onClick={() => store.removeLocation(l.id)}
                >
                  Delete
                </button>
              </div>
              <div className="mt-3">
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={l.description}
                  onChange={(e) => store.updateLocation(l.id, { description: e.target.value })}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-3">
          {store.notes.length === 0 && (
            <EmptyState title="No notes yet" hint="Capture ideas above." />
          )}
          {store.notes.map((n) => (
            <Card key={n.id}>
              <div className="flex items-center justify-between gap-2">
                <Input
                  className="font-medium"
                  value={n.title}
                  onChange={(e) => store.updateNote(n.id, { title: e.target.value })}
                />
                <button
                  className="text-rose-500 hover:underline"
                  onClick={() => store.removeNote(n.id)}
                >
                  Delete
                </button>
              </div>
              <Textarea
                className="mt-3"
                rows={3}
                value={n.content}
                onChange={(e) => store.updateNote(n.id, { content: e.target.value })}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
