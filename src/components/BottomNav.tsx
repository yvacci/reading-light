import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, CalendarCheck, BookText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { t } from '@/lib/i18n';
import { useEffect, useRef, useState, useMemo } from 'react';
import { recordTabPosition, getTabRoot, useTabNavigation } from '@/hooks/useTabMemory';

export default function BottomNav() {
  const { language } = useReadingProgress();
  const navigate = useNavigate();
  const location = useLocation();
  const { getNavigationTarget } = useTabNavigation();

  const navItems = [
    { to: '/', icon: Home, labelKey: 'nav.home' },
    { to: '/reader', icon: BookOpen, labelKey: 'nav.bible' },
    { to: '/daily-text', icon: BookText, labelKey: 'nav.dailyText' },
    { to: '/pioneer', icon: CalendarCheck, labelKey: 'nav.pioneer' },
    { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
  ];

  // Record tab position on every route change
  useEffect(() => {
    recordTabPosition(location.pathname);
  }, [location.pathname]);

  const activeTabIndex = useMemo(() => {
    const root = getTabRoot(location.pathname);
    return navItems.findIndex(item => item.to === root);
  }, [location.pathname]);

  const handleTabClick = (e: React.MouseEvent, to: string) => {
    e.preventDefault();
    const target = getNavigationTarget(to);
    navigate(target);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl safe-bottom">
        <div className="mx-auto flex max-w-lg items-center justify-around py-1">
          {navItems.map(({ to, icon: Icon, labelKey }) => {
            const currentRoot = getTabRoot(location.pathname);
            const isActive = to === currentRoot;
            return (
              <button
                key={to}
                onClick={(e) => handleTabClick(e, to)}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-all duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full bg-primary" />
                )}
                <Icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "scale-110")} />
                <span className="leading-tight">{t(labelKey, language)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
