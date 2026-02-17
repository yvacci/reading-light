import { useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'nwt-tab-memory';

interface TabMemory {
  [tabRoot: string]: string; // e.g. "/reader" -> "/reader/1/3"
}

const TAB_DEFAULTS: Record<string, string> = {
  '/': '/',
  '/reader': '/reader',
  '/daily-text': '/daily-text',
  '/pioneer': '/pioneer',
  '/settings': '/settings',
};

function loadMemory(): TabMemory {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function saveMemory(mem: TabMemory) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mem));
}

export function getTabRoot(path: string): string {
  if (path === '/') return '/';
  const parts = path.split('/').filter(Boolean);
  return '/' + parts[0];
}

/**
 * Records the current route as the last visited location for the current tab.
 */
export function recordTabPosition(pathname: string) {
  const root = getTabRoot(pathname);
  if (!TAB_DEFAULTS[root]) return;
  const mem = loadMemory();
  mem[root] = pathname;
  saveMemory(mem);
}

/**
 * Returns the saved position for a tab, or null if none.
 */
export function getSavedTabPosition(tabRoot: string): string | null {
  const mem = loadMemory();
  const saved = mem[tabRoot];
  // Only return if it's different from default (i.e. there's a deeper position)
  if (saved && saved !== tabRoot) return saved;
  return null;
}

/**
 * Hook for BottomNav: handles single-tap (resume) vs double-tap (reset) logic.
 */
export function useTabNavigation() {
  const lastTapRef = useRef<{ path: string; time: number }>({ path: '', time: 0 });
  const location = useLocation();

  const getNavigationTarget = useCallback((tabDefault: string): string => {
    const now = Date.now();
    const lastTap = lastTapRef.current;
    const isDoubleTap = lastTap.path === tabDefault && (now - lastTap.time) < 400;

    lastTapRef.current = { path: tabDefault, time: now };

    if (isDoubleTap) {
      // Double tap: go to default
      return tabDefault;
    }

    // Single tap: check if we're already on this tab
    const currentRoot = getTabRoot(location.pathname);
    if (currentRoot === tabDefault) {
      // Already on this tab — go to default (like toggling back)
      return tabDefault;
    }

    // Coming from another tab — resume saved position
    const saved = getSavedTabPosition(tabDefault);
    return saved || tabDefault;
  }, [location.pathname]);

  return { getNavigationTarget };
}
