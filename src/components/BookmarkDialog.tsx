import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { getLocalizedBookName } from '@/lib/localization';
import { t } from '@/lib/i18n';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const COLORS = [
  { id: 'yellow', label: 'Yellow', class: 'bg-yellow-300' },
  { id: 'blue', label: 'Blue', class: 'bg-blue-300' },
  { id: 'green', label: 'Green', class: 'bg-green-300' },
  { id: 'pink', label: 'Pink', class: 'bg-pink-300' },
  { id: 'purple', label: 'Purple', class: 'bg-purple-300' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: number;
  chapter: number;
  verse?: number;
  selectedText: string;
}

export default function BookmarkDialog({ open, onOpenChange, bookId, chapter, verse, selectedText }: Props) {
  const { addBookmark } = useBookmarks();
  const { language } = useReadingProgress();
  const [note, setNote] = useState('');
  const [color, setColor] = useState('yellow');

  const bookName = getLocalizedBookName(bookId, language);

  const handleSave = () => {
    addBookmark({
      bookId,
      chapter,
      verse,
      verseText: selectedText.slice(0, 300),
      note: note.trim(),
      color,
    });
    setNote('');
    setColor('yellow');
    onOpenChange(false);
  };

  const locationLabel = verse
    ? `${bookName} ${chapter}:${verse}`
    : `${bookName} ${chapter}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[92vw] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Bookmark className="h-4 w-4 text-primary" />
            {t('bookmarks.saveBookmark', language)}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {locationLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted/50 p-3 text-xs text-foreground/80 leading-relaxed max-h-24 overflow-y-auto">
          {selectedText.slice(0, 200)}
          {selectedText.length > 200 && '…'}
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">{t('bookmarks.highlightColor', language)}</p>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setColor(c.id)}
                className={`h-7 w-7 rounded-full ${c.class} transition-all ${
                  color === c.id
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                    : 'hover:scale-105'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('bookmarks.addNote', language)}
          className="text-sm rounded-xl resize-none"
          rows={2}
        />

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel', language)}
          </Button>
          <Button size="sm" onClick={handleSave}>
            {t('bookmarks.saveBookmark', language)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
