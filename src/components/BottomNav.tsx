import { NavLink } from 'react-router-dom';
import { Home, BookOpen, CalendarCheck, BookText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { t } from '@/lib/i18n';

export default function BottomNav() {
  const { language } = useReadingProgress();

  const navItems = [
    { to: '/', icon: Home, labelKey: 'nav.home' },
    { to: '/reader', icon: BookOpen, labelKey: 'nav.bible' },
    { to: '/daily-text', icon: BookText, labelKey: 'nav.dailyText' },
    { to: '/pioneer', icon: CalendarCheck, labelKey: 'nav.pioneer' },
    { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-1">
        {navItems.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-all duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full bg-primary" />
                )}
                <Icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "scale-110")} />
                <span className="leading-tight">{t(labelKey, language)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
