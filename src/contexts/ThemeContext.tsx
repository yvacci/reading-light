import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeName = 'bento' | 'glassmorphic' | 'neo-brutalist' | 'soft-minimalist' | 'cottagecore';
export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeName;
  mode: ThemeMode;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const STORAGE_KEY = 'nwt-theme';

interface ThemeState {
  theme: ThemeName;
  mode: ThemeMode;
}

const defaultState: ThemeState = { theme: 'bento', mode: 'light' };

function loadTheme(): ThemeState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultState, ...JSON.parse(stored) };
  } catch {}
  // Migrate from old darkMode setting
  try {
    const old = localStorage.getItem('nwt-reading-progress');
    if (old) {
      const parsed = JSON.parse(old);
      if (parsed.darkMode) return { ...defaultState, mode: 'dark' };
    }
  } catch {}
  return defaultState;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ThemeState>(loadTheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove('dark', 'theme-bento', 'theme-glassmorphic', 'theme-neo-brutalist', 'theme-soft-minimalist', 'theme-cottagecore');
    // Add current theme
    root.classList.add(`theme-${state.theme}`);
    if (state.mode === 'dark') root.classList.add('dark');
  }, [state.theme, state.mode]);

  const setTheme = useCallback((theme: ThemeName) => {
    setState(prev => ({ ...prev, theme }));
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const toggleMode = useCallback(() => {
    setState(prev => ({ ...prev, mode: prev.mode === 'light' ? 'dark' : 'light' }));
  }, []);

  return (
    <ThemeContext.Provider value={{ ...state, setTheme, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// Theme metadata for selector UI
export const THEME_OPTIONS: { id: ThemeName; name: string; description: string; preview: string }[] = [
  { id: 'bento', name: 'Bento', description: 'Modern & Organized', preview: '🧱' },
  { id: 'glassmorphic', name: 'Glassmorphic', description: 'Sleek & Layered', preview: '🔮' },
  { id: 'neo-brutalist', name: 'Neo-Brutalist', description: 'Bold & Edgy', preview: '⚡' },
  { id: 'soft-minimalist', name: 'Soft Minimalist', description: 'Calm & Organic', preview: '🌿' },
  { id: 'cottagecore', name: 'Cottagecore', description: 'Cozy & Nostalgic', preview: '🏡' },
];
