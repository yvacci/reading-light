import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Trash2, Edit3, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useJournal, type JournalEntry } from '@/contexts/JournalContext';
import { getLocalizedBookName } from '@/lib/localization';
import { t } from '@/lib/i18n';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import PageHeader from '@/components/PageHeader';
import JournalEntryDialog from '@/components/JournalEntryDialog';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const MOODS: Record<string, string> = {
  '🙏': 'Prayerful',
  '💡': 'Insightful',
  '❤️': 'Grateful',
  '🤔': 'Reflective',
  '😊': 'Joyful',
  '📚': 'Studious',
};

export default function JournalPage() {
  const { entries, removeEntry } = useJournal();
  const { language } = useReadingProgress();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title={t('journal.title', language)}
        subtitle={t('journal.subtitle', language)}
        actions={
          <Button size="sm" onClick={handleNew} className="gap-1 text-xs rounded-full">
            <PenLine className="h-3.5 w-3.5" />
            {t('journal.newEntry', language)}
          </Button>
        }
      />

      <div className="px-4 pt-4 space-y-3">
        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 py-16 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <PenLine className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{t('journal.empty', language)}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('journal.emptyHint', language)}
            </p>
            <Button onClick={handleNew} className="mt-2 gap-2 rounded-full">
              <PenLine className="h-4 w-4" />
              {t('journal.writeFirst', language)}
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {entries.map((entry) => {
              const bookName = getLocalizedBookName(entry.bookId, language);
              const location = entry.verse
                ? `${bookName} ${entry.chapter}:${entry.verse}`
                : `${bookName} ${entry.chapter}`;
              const isExpanded = expandedId === entry.id;
              const dateStr = new Date(entry.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
                      {entry.mood || '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{entry.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px] text-primary font-medium">
                          <BookOpen className="h-3 w-3" />
                          {location}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{dateStr}</span>
                      </div>
                      {!isExpanded && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.content}</p>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          <div className="rounded-xl bg-muted/50 p-3 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {entry.content}
                          </div>
                          {entry.mood && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {t('journal.mood', language)}: {entry.mood} {MOODS[entry.mood] || ''}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(entry)}
                              className="gap-1 text-xs rounded-full"
                            >
                              <Edit3 className="h-3 w-3" />
                              {t('journal.edit', language)}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1 text-xs text-destructive rounded-full">
                                  <Trash2 className="h-3 w-3" />
                                  {t('journal.delete', language)}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('journal.deleteConfirm', language)}</AlertDialogTitle>
                                  <AlertDialogDescription>{t('journal.deleteDesc', language)}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('common.cancel', language)}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => removeEntry(entry.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {t('common.delete', language)}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <JournalEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editEntry={editingEntry}
      />
    </div>
  );
}
