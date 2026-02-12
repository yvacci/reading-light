import { useState, useEffect, useCallback } from 'react';
import { X, BookOpen, Clock, Link2, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePioneer } from '@/contexts/PioneerContext';
import { Progress } from '@/components/ui/progress';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Optional: show specific verse content */
  verseRef?: { bookId: number; chapter: number; verse?: number; text?: string };
  /** Optional: footnotes/cross-refs for the verse */
  footnotes?: string[];
  /** Optional: URL for quick link */
  quickLinkUrl?: string;
}

const PIONEER_VERSES = [
  { ref: 'Mateo 28:19, 20', text: '"Kaya humayo kayo at gumawa ng mga alagad mula sa mga tao ng lahat ng bansa."' },
  { ref: 'Isaias 6:8', text: '"Narito ako! Isugo mo ako!"' },
  { ref: 'Roma 10:14', text: '"Paano naman sila tatawag sa kaniya kung hindi sila naniwala sa kaniya?"' },
  { ref: '2 Timoteo 4:2', text: '"Ipangaral mo ang salita; gawin mo ito nang may pagkaapurahan."' },
  { ref: 'Mga Gawa 1:8', text: '"Kayo ay magiging mga saksi ko... hanggang sa pinakamalayong bahagi ng lupa."' },
  { ref: 'Mateo 24:14', text: '"Ang mabuting balitang ito ng Kaharian ay ipangangaral sa buong lupa."' },
  { ref: 'Kawikaan 3:5, 6', text: '"Magtiwala ka kay Jehova nang buong puso mo."' },
  { ref: 'Filipos 4:13', text: '"May lakas akong harapin ang lahat ng bagay sa pamamagitan niya na nagbibigay ng kapangyarihan sa akin."' },
];

const QUICK_LINKS = [
  { label: 'WOL Bibliya', url: 'https://wol.jw.org/tl/wol/binav/r27/lp-tg', icon: BookOpen },
  { label: 'JW.org Tagalog', url: 'https://www.jw.org/tl/', icon: Link2 },
  { label: 'Pag-aaral sa Bibliya', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/aklat/', icon: BookOpen },
  { label: 'Mga Publikasyon', url: 'https://www.jw.org/tl/library/', icon: Link2 },
];

export default function ReferencePane({ open, onClose, verseRef, footnotes, quickLinkUrl }: Props) {
  const { entries } = usePioneer();
  const [randomVerse, setRandomVerse] = useState(PIONEER_VERSES[0]);

  useEffect(() => {
    if (open) {
      setRandomVerse(PIONEER_VERSES[Math.floor(Math.random() * PIONEER_VERSES.length)]);
    }
  }, [open]);

  // Calculate current month hours
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  let totalHours = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const e = entries[key];
    if (e) totalHours += e.ministryHours + e.witnessingHours;
  }
  const TARGET = 50;
  const hoursPercent = Math.min(100, Math.round((totalHours / TARGET) * 100));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-foreground/30"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 z-[61] w-[85%] max-w-md bg-background border-r border-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Regular Pioneer</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-5">
                {/* Verse of encouragement */}
                {!verseRef && (
                  <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">Pampatibay</p>
                    <p className="text-sm text-foreground italic leading-relaxed">{randomVerse.text}</p>
                    <p className="text-xs text-primary font-semibold mt-2">— {randomVerse.ref}</p>
                  </div>
                )}

                {/* Verse content when a verse is selected */}
                {verseRef && (
                  <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">Talata</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {verseRef.text || `${verseRef.bookId} ${verseRef.chapter}:${verseRef.verse || ''}`}
                    </p>
                  </div>
                )}

                {/* Footnotes & Cross-References */}
                {footnotes && footnotes.length > 0 && (
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Mga Footnote at Cross-Reference</p>
                    <div className="space-y-1.5">
                      {footnotes.map((fn, i) => (
                        <p key={i} className="text-xs text-foreground leading-relaxed">{fn}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Monthly Goal */}
                <div className="rounded-xl bg-muted/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Aking Layunin sa Buwan</p>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Oras ng Ministeryo</span>
                    <span className={`text-sm font-bold ${totalHours >= TARGET ? 'text-[hsl(145,65%,42%)]' : 'text-primary'}`}>
                      {totalHours} / {TARGET}
                    </span>
                  </div>
                  <Progress value={hoursPercent} className="h-2" />
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {hoursPercent >= 100 ? 'Naabot na ang target! 🎉' : `${TARGET - totalHours} oras pa ang kailangan`}
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">Mabilis na Link</p>
                  <div className="space-y-1">
                    {QUICK_LINKS.map((link) => (
                      <button
                        key={link.url}
                        onClick={() => window.open(link.url, '_blank')}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                      >
                        <link.icon className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-xs font-medium text-foreground flex-1">{link.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick link URL if provided */}
                {quickLinkUrl && (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="px-3 py-2 bg-muted/30 border-b border-border">
                      <p className="text-[10px] text-muted-foreground truncate">{quickLinkUrl}</p>
                    </div>
                    <iframe
                      src={quickLinkUrl}
                      className="w-full h-64 border-0"
                      title="Reference"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
