import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface SettingsState {
  theme: Theme;
  init: () => void;
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE = 'novelryt.theme';

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

// AI keys are NOT stored client-side — they live server-side in the Cloudflare
// Pages Function (ADR 002). This store now only holds UI preferences.
export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'dark',
  init: () => {
    const theme = (localStorage.getItem(THEME_STORAGE) as Theme) || 'dark';
    applyTheme(theme);
    set({ theme });
  },
  setTheme: (theme) => {
    localStorage.setItem(THEME_STORAGE, theme);
    applyTheme(theme);
    set({ theme });
  },
}));
