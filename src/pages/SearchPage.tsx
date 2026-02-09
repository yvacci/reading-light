import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { searchBible, type SearchResult } from '@/lib/search-service';
import { t } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/PageHeader';
import { motion } from 'framer-motion';

export default function SearchPage() {
  const navigate = useNavigate();
  const { language } = useReadingProgress();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searched, setSearched] = useState(false);
  const abortRef = useRef(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || query.trim().length < 2) return;

    abortRef.current = false;
    setSearching(true);
    setProgress(0);
    setResults([]);
    setSearched(true);

    try {
      const found = await searchBible(query, language, (p) => {
        if (!abortRef.current) setProgress(p);
      });
      if (!abortRef.current) setResults(found);
    } catch (err) {
      console.error('Search error:', err);
    }

    setSearching(false);
  }, [query, language]);

  const clearSearch = useCallback(() => {
    abortRef.current = true;
    setQuery('');
    setResults([]);
    setSearching(false);
    setSearched(false);
  }, []);

  const highlightMatch = (text: string, q: string) => {
    const lowerText = text.toLowerCase();
    const lowerQ = q.toLowerCase();
    const idx = lowerText.indexOf(lowerQ);
    if (idx === -1) return text;

    return (
      <>
        {text.slice(0, idx)}
        <span className="bg-primary/25 text-primary font-semibold rounded-sm px-0.5">
          {text.slice(idx, idx + q.length)}
        </span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title={t('search.title', language)} subtitle={t('search.subtitle', language)} showBack />

      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('search.placeholder', language)}
            className="pl-9 pr-9 rounded-xl"
            autoFocus
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={handleSearch}
          disabled={searching || query.trim().length < 2}
          className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {searching ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('search.searching', language)} {progress}%
            </span>
          ) : (
            t('search.button', language)
          )}
        </button>

        {searching && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="mt-4 space-y-2">
          {!searching && searched && results.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t('search.noResults', language)} "{query}"
            </p>
          )}

          {results.length > 0 && (
            <p className="text-xs text-muted-foreground mb-2">
              {results.length} {t('search.results', language)}
            </p>
          )}

          {results.map((result, i) => (
            <motion.button
              key={`${result.bookId}-${result.chapter}-${result.matchIndex}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
              onClick={() => navigate(`/reader/${result.bookId}/${result.chapter}`)}
              className="flex w-full flex-col gap-1 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50"
            >
              <span className="text-xs font-semibold text-primary">
                {result.bookName} {result.chapter}
              </span>
              <span className="text-xs text-foreground/80 leading-relaxed">
                {highlightMatch(result.snippet, query)}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
