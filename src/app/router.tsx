import { createBrowserRouter, Navigate } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import AppLayout from './AppLayout';
import LoginPage from '@/features/auth/LoginPage';
import ProjectsPage from '@/features/projects/ProjectsPage';
import ProjectDashboard from '@/features/projects/ProjectDashboard';
import EditorPage from '@/features/editor/EditorPage';
import StoryBiblePage from '@/features/storybible/StoryBiblePage';
import StoryChatPage from '@/features/ai/StoryChatPage';
import SettingsPage from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/projects" replace /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:projectId', element: <ProjectDashboard /> },
      { path: 'projects/:projectId/write', element: <EditorPage /> },
      { path: 'projects/:projectId/bible', element: <StoryBiblePage /> },
      { path: 'projects/:projectId/chat', element: <StoryChatPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/projects" replace /> },
]);
