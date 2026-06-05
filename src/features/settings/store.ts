import { create } from 'zustand';
import { aiGateway } from '@/features/ai/gateway';

type Theme = 'light' | 'dark';

interface SettingsState {
  apiKeys: string[];
  theme: Theme;
  init: () => void;
  setApiKeys: (keys: string[]) => void;
  setTheme: (theme: Theme) => void;
}

const KEYS_STORAGE = 'novelryt.ai.keys';
const THEME_STORAGE = 'novelryt.theme';

function loadKeys(): string[] {
  // In-app keys take precedence; env var is a dev fallback (see .env.example).
  const stored = localStorage.getItem(KEYS_STORAGE);
  if (stored) {
    try {
      return JSON.parse(stored) as string[];
    } catch {
      /* ignore */
    }
  }
  const env = import.meta.env.VITE_GEMINI_API_KEYS as string | undefined;
  return env ? env.split(',').map((k) => k.trim()).filter(Boolean) : [];
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const useSettingsStore = create<SettingsState>((set) => ({
  apiKeys: [],
  theme: 'dark',
  init: () => {
    const apiKeys = loadKeys();
    const theme = (localStorage.getItem(THEME_STORAGE) as Theme) || 'dark';
    aiGateway.setKeys(apiKeys);
    applyTheme(theme);
    set({ apiKeys, theme });
  },
  setApiKeys: (keys) => {
    const cleaned = keys.map((k) => k.trim()).filter(Boolean);
    localStorage.setItem(KEYS_STORAGE, JSON.stringify(cleaned));
    aiGateway.setKeys(cleaned);
    set({ apiKeys: cleaned });
  },
  setTheme: (theme) => {
    localStorage.setItem(THEME_STORAGE, theme);
    applyTheme(theme);
    set({ theme });
  },
}));
