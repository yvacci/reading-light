import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Search, CalendarCheck, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { t } from '@/lib/i18n';

export default function BottomNav() {
  const { language } = useReadingProgress();

  const navItems = [
    { to: '/', icon: Home, labelKey: 'nav.home' },
    { to: '/reader', icon: BookOpen, labelKey: 'nav.bible' },
    { to: '/pioneer', icon: CalendarCheck, labelKey: 'nav.pioneer' },
    { to: '/studies', icon: Users, labelKey: 'nav.studies' },
    { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-1.5">
        {navItems.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{t(labelKey, language)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
