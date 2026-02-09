import { useState, useEffect } from 'react';
import { PenLine, BookOpen } from 'lucide-react';
import { useJournal, type JournalEntry } from '@/contexts/JournalContext';
import { BIBLE_BOOKS, getBookById } from '@/lib/bible-data';
import { getLocalizedBookName } from '@/lib/localization';
import { t } from '@/lib/i18n';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const MOODS = ['🙏', '💡', '❤️', '🤔', '😊', '📚'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editEntry?: JournalEntry | null;
  prefillBookId?: number;
  prefillChapter?: number;
  prefillVerse?: number;
}

export default function JournalEntryDialog({
  open,
  onOpenChange,
  editEntry,
  prefillBookId,
  prefillChapter,
  prefillVerse,
}: Props) {
  const { addEntry, updateEntry } = useJournal();
  const { language } = useReadingProgress();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string>('');
  const [bookId, setBookId] = useState<number>(prefillBookId || 1);
  const [chapter, setChapter] = useState<number>(prefillChapter || 1);
  const [verse, setVerse] = useState<string>(prefillVerse?.toString() || '');

  const selectedBook = getBookById(bookId);

  useEffect(() => {
    if (editEntry) {
      setTitle(editEntry.title);
      setContent(editEntry.content);
      setMood(editEntry.mood || '');
      setBookId(editEntry.bookId);
      setChapter(editEntry.chapter);
      setVerse(editEntry.verse?.toString() || '');
    } else {
      setTitle('');
      setContent('');
      setMood('');
      setBookId(prefillBookId || 1);
      setChapter(prefillChapter || 1);
      setVerse(prefillVerse?.toString() || '');
    }
  }, [editEntry, open, prefillBookId, prefillChapter, prefillVerse]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    if (editEntry) {
      updateEntry(editEntry.id, { title: title.trim(), content: content.trim(), mood: mood || undefined });
    } else {
      addEntry({
        bookId,
        chapter,
        verse: verse ? parseInt(verse) : undefined,
        title: title.trim(),
        content: content.trim(),
        mood: mood || undefined,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[92vw] rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <PenLine className="h-4 w-4 text-primary" />
            {editEntry ? t('journal.editEntry', language) : t('journal.newJournalEntry', language)}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t('journal.writeReflection', language)}
          </DialogDescription>
        </DialogHeader>

        {!editEntry && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {t('journal.scriptureRef', language)}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Select value={bookId.toString()} onValueChange={(v) => { setBookId(Number(v)); setChapter(1); }}>
                <SelectTrigger className="text-xs h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {BIBLE_BOOKS.map(b => (
                    <SelectItem key={b.id} value={b.id.toString()} className="text-xs">
                      {getLocalizedBookName(b.id, language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={chapter.toString()} onValueChange={(v) => setChapter(Number(v))}>
                <SelectTrigger className="text-xs h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {selectedBook && Array.from({ length: selectedBook.chapters }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()} className="text-xs">
                      Ch. {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                placeholder={language === 'en' ? 'Verse' : 'Talata'}
                className="text-xs h-9 rounded-xl"
                min={1}
              />
            </div>
          </div>
        )}

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('journal.entryTitle', language)}
          className="text-sm rounded-xl"
        />

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">{t('journal.moodOptional', language)}</p>
          <div className="flex gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(mood === m ? '' : m)}
                className={`h-9 w-9 rounded-full text-lg transition-all flex items-center justify-center ${
                  mood === m
                    ? 'bg-primary/15 ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                    : 'bg-muted hover:scale-105'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('journal.writePlaceholder', language)}
          className="text-sm rounded-xl resize-none"
          rows={5}
        />

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel', language)}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!title.trim() || !content.trim()}>
            {editEntry ? t('journal.update', language) : t('journal.save', language)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
