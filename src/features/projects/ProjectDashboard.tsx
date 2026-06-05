import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '@/components/ui';
import { projectsRepo, chaptersRepo, charactersRepo } from '@/services/db/repositories';
import type { Project } from '@/types';

export default function ProjectDashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState({ chapters: 0, words: 0, characters: 0 });

  useEffect(() => {
    if (!projectId) return;
    void (async () => {
      const [p, chapters, characters] = await Promise.all([
        projectsRepo.get(projectId),
        chaptersRepo.byProject(projectId),
        charactersRepo.byProject(projectId),
      ]);
      setProject(p ?? null);
      setStats({
        chapters: chapters.length,
        words: chapters.reduce((sum, c) => sum + c.wordCount, 0),
        characters: characters.length,
      });
    })();
  }, [projectId]);

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
    </div>
  );
}
