import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, Button, Input, Label } from '@/components/ui';
import { projectsRepo, chaptersRepo, charactersRepo } from '@/services/db/repositories';
import { exportProject, type ExportFormat } from '@/features/export/export-service';
import { getStats, type WritingStats } from '@/features/stats/writing-stats';
import type { Project } from '@/types';

export default function ProjectDashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState({ chapters: 0, words: 0, characters: 0 });
  const [writing, setWriting] = useState<WritingStats | null>(null);
  const [goal, setGoal] = useState(500);

  useEffect(() => {
    if (!projectId) return;
    void (async () => {
      const [p, chapters, characters] = await Promise.all([
        projectsRepo.get(projectId),
        chaptersRepo.byProject(projectId),
        charactersRepo.byProject(projectId),
      ]);
      setProject(p ?? null);
      setGoal(p?.dailyWordGoal ?? 500);
      const words = chapters.reduce((sum, c) => sum + c.wordCount, 0);
      setStats({ chapters: chapters.length, words, characters: characters.length });
      setWriting(getStats(projectId, words));
    })();
  }, [projectId]);

  async function saveGoal(value: number) {
    setGoal(value);
    if (projectId) await projectsRepo.update(projectId, { dailyWordGoal: value });
  }

  if (!project) return <div className="p-6 text-slate-500">Loading…</div>;

  const cards = [
    { label: 'Words', value: stats.words.toLocaleString() },
    { label: 'Chapters', value: stats.chapters },
    { label: 'Characters', value: stats.characters },
    { label: 'Status', value: project.status },
  ];

  const links = [
    { to: `/projects/${project.id}/write`, title: 'Write', desc: 'Open the manuscript editor' },
    { to: `/projects/${project.id}/bible`, title: 'Story Bible', desc: 'Characters, locations, notes' },
    { to: `/projects/${project.id}/timeline`, title: 'Timeline', desc: 'Chronological story events' },
    { to: `/projects/${project.id}/diagnostics`, title: 'Story Doctor', desc: 'AI consistency & plot analysis' },
    { to: `/projects/${project.id}/chat`, title: 'Story Chat', desc: 'Project-aware AI assistant' },
  ];

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">{project.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {project.genre || 'Untitled genre'} · {project.status}
      </p>
      {project.description && (
        <p className="mt-3 text-slate-600 dark:text-slate-300">{project.description}</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <p className="text-2xl font-semibold">{c.value}</p>
            <p className="text-xs uppercase tracking-wide text-slate-400">{c.label}</p>
          </Card>
        ))}
      </div>

      {writing && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Writing goal</h2>
            <div className="flex items-center gap-2">
              <Label>Daily goal</Label>
              <Input
                type="number"
                className="w-24"
                value={goal}
                min={0}
                onChange={(e) => saveGoal(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{ width: `${Math.min(100, goal ? (writing.today / goal) * 100 : 0)}%` }}
            />
          </div>
          <div className="mt-3 flex gap-6 text-sm">
            <span><strong>{writing.today.toLocaleString()}</strong> words today</span>
            <span><strong>{goal.toLocaleString()}</strong> goal</span>
            <span>🔥 <strong>{writing.streak}</strong>-day streak</span>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {links.map((l) => (
          <Link key={l.to} to={l.to}>
            <Card className="h-full transition-colors hover:border-indigo-400">
              <h2 className="font-medium">{l.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{l.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="font-medium">Export</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your work, in open formats — never locked in.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ['docx', 'Word (.docx)'],
              ['pdf', 'PDF (print)'],
              ['txt', 'Manuscript (.txt)'],
              ['md', 'Manuscript (.md)'],
              ['json', 'Full backup (.json)'],
            ] as [ExportFormat, string][]
          ).map(([fmt, label]) => (
            <Button key={fmt} variant="secondary" onClick={() => exportProject(project.id, fmt)}>
              {label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
