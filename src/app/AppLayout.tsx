import { NavLink, Outlet, useParams, Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { cx } from '@/lib/utils';

function navClass({ isActive }: { isActive: boolean }): string {
  return cx(
    'rounded-md px-3 py-2 text-sm font-medium',
    isActive
      ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  );
}

export default function AppLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, signOut } = useAuthStore();

  return (
    <div className="flex h-full">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 p-3 dark:border-slate-800">
        <Link to="/projects" className="px-3 py-2 text-lg font-semibold">
          NovelRyt
        </Link>
        <nav className="mt-4 flex flex-1 flex-col gap-1">
          <NavLink to="/projects" className={navClass} end>
            Projects
          </NavLink>
          {projectId && (
            <>
              <div className="mt-3 px-3 text-xs uppercase tracking-wide text-slate-400">
                Current project
              </div>
              <NavLink to={`/projects/${projectId}`} className={navClass} end>
                Dashboard
              </NavLink>
              <NavLink to={`/projects/${projectId}/write`} className={navClass}>
                Write
              </NavLink>
              <NavLink to={`/projects/${projectId}/bible`} className={navClass}>
                Story Bible
              </NavLink>
              <NavLink to={`/projects/${projectId}/timeline`} className={navClass}>
                Timeline
              </NavLink>
              <NavLink to={`/projects/${projectId}/diagnostics`} className={navClass}>
                Story Doctor
              </NavLink>
              <NavLink to={`/projects/${projectId}/chat`} className={navClass}>
                Story Chat
              </NavLink>
            </>
          )}
          <div className="flex-1" />
          <NavLink to="/settings" className={navClass}>
            Settings
          </NavLink>
        </nav>
        <div className="border-t border-slate-200 pt-3 text-xs text-slate-400 dark:border-slate-800">
          <p className="truncate px-3">{user?.displayName}</p>
          <button className="px-3 py-1 hover:text-slate-700" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
