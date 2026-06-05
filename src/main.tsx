import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { useAuthStore } from './features/auth/store';
import { useSettingsStore } from './features/settings/store';
import './styles/index.css';

// Initialize session + settings (theme, AI keys) before first render.
useSettingsStore.getState().init();
useAuthStore.getState().init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
