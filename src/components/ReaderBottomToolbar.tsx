import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Bookmark, CheckCircle2, CalendarDays, PenLine } from 'lucide-react';
import { t } from '@/lib/i18n';

export default function ReaderBottomToolbar() {
  const navigate = useNavigate();

  const actions = [
    { icon: BookOpen, label: 'Buksan ang Bibliya', to: '/reader' },
    { icon: Search, label: 'Maghanap', to: '/search' },
    { icon: Bookmark, label: 'Mga Bookmark', to: '/bookmarks' },
    { icon: PenLine, label: 'Talaarawan', to: '/journal' },
    { icon: CheckCircle2, label: 'Tingnan ang Progreso', to: '/progress' },
  ];

  return (
    <div className="border-t border-border bg-card/95 backdrop-blur-lg px-2 py-2">
      <div className="flex items-center justify-around">
        {actions.map(({ icon: Icon, label, to }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg transition-colors hover:bg-muted/50"
          >
            <Icon className="h-4 w-4 text-primary" />
            <span className="text-[8px] font-medium text-muted-foreground leading-tight text-center max-w-[56px]">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
