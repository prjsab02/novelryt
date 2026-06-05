import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTimelineStore } from './store';
import { Button, Card, Input, Textarea, Label, EmptyState } from '@/components/ui';

export default function TimelinePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { events, load, addEvent, updateEvent, removeEvent } = useTimelineStore();
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (projectId) void load(projectId);
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  function add() {
    void addEvent(title);
    setTitle('');
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Timeline</h1>
      <p className="mb-4 text-sm text-slate-500">
        Order events chronologically. Sequence controls order; date labels are
        free-form to suit any fictional calendar.
      </p>

      <div className="mb-6 flex gap-2">
        <Input
          placeholder="Add an event…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <Button onClick={add}>Add event</Button>
      </div>

      {events.length === 0 ? (
        <EmptyState title="No events yet" hint="Add key moments to build your timeline." />
      ) : (
        <ol className="relative space-y-4 border-l border-slate-300 pl-6 dark:border-slate-700">
          {events.map((ev) => (
            <li key={ev.id} className="relative">
              <span className="absolute -left-[1.65rem] top-2 h-3 w-3 rounded-full bg-indigo-500" />
              <Card>
                <div className="flex items-center justify-between gap-2">
                  <Input
                    className="font-medium"
                    value={ev.title}
                    onChange={(e) => updateEvent(ev.id, { title: e.target.value })}
                  />
                  <button
                    className="text-rose-500 hover:underline"
                    onClick={() => removeEvent(ev.id)}
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label>Date label</Label>
                    <Input
                      value={ev.dateLabel}
                      onChange={(e) => updateEvent(ev.id, { dateLabel: e.target.value })}
                      placeholder="Year 3, Spring"
                    />
                  </div>
                  <div>
                    <Label>Sequence</Label>
                    <Input
                      type="number"
                      value={ev.sequence}
                      onChange={(e) =>
                        updateEvent(ev.id, { sequence: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label>Participants</Label>
                    <Input
                      value={ev.participants}
                      onChange={(e) => updateEvent(ev.id, { participants: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Label>Description</Label>
                  <Textarea
                    rows={2}
                    value={ev.description}
                    onChange={(e) => updateEvent(ev.id, { description: e.target.value })}
                  />
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
