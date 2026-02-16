import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, BookOpen, Clock, Link2, Star, ChevronRight, MapPin, Users, Bell, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePioneer } from '@/contexts/PioneerContext';
import { useStudies } from '@/contexts/StudiesContext';
import { Progress } from '@/components/ui/progress';

interface Props {
  open: boolean;
  onClose: () => void;
  verseRef?: { bookId: number; chapter: number; verse?: number; text?: string };
  footnotes?: string[];
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
  const navigate = useNavigate();
  const { entries } = usePioneer();
  const { getUpcomingVisits, studies } = useStudies();
  const [randomVerse, setRandomVerse] = useState(PIONEER_VERSES[0]);

  useEffect(() => {
    if (open) {
      setRandomVerse(PIONEER_VERSES[Math.floor(Math.random() * PIONEER_VERSES.length)]);
    }
  }, [open]);

  const upcomingVisits = open ? getUpcomingVisits() : [];
  
  const scheduledVisits = open ? studies.filter(s => s.nextVisitDate).sort((a, b) => 
    (a.nextVisitDate || '').localeCompare(b.nextVisitDate || '')
  ).slice(0, 5) : [];

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

  const handleGoToVerse = () => {
    if (verseRef) {
      onClose();
      navigate(`/reader/${verseRef.bookId}/${verseRef.chapter}`);
    }
  };

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
              <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
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

                {/* Verse content when a verse is selected (from Daily Text or reader) */}
                {verseRef && (
                  <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">Binanggit na Teksto</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line text-left">
                      {verseRef.text || `${verseRef.bookId} ${verseRef.chapter}:${verseRef.verse || ''}`}
                    </p>
                    <button
                      onClick={handleGoToVerse}
                      className="mt-2 text-[11px] text-primary font-semibold hover:underline transition-colors flex items-center gap-1"
                    >
                      <BookOpen className="h-3 w-3" />
                      Buksan sa Bibliya
                      <ChevronRight className="h-3 w-3" />
                    </button>
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

                {/* Visit Reminders - Needs Visit */}
                {upcomingVisits.length > 0 && (
                  <div className="rounded-xl bg-destructive/5 p-4 border border-destructive/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Bell className="h-4 w-4 text-destructive" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-destructive">Kailangang Dalawin</p>
                    </div>
                    <div className="space-y-2">
                      {upcomingVisits.map(visit => {
                        const daysSince = visit.lastVisitDate
                          ? Math.floor((Date.now() - new Date(visit.lastVisitDate + 'T12:00:00').getTime()) / 86400000)
                          : null;
                        return (
                          <div key={visit.id} className="flex items-start gap-2.5 rounded-lg bg-background/80 p-2.5">
                            <Users className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-foreground">{visit.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {visit.type === 'bible-study' ? 'Bible Study' : 'Return Visit'}
                                {daysSince !== null && ` · ${daysSince} araw na ang nakakaraan`}
                              </p>
                              {visit.nextVisitDate && (
                                <p className="text-[10px] text-primary font-medium mt-0.5">
                                  Susunod: {new Date(visit.nextVisitDate + 'T12:00:00').toLocaleDateString()}
                                  {visit.nextVisitTime && ` ${visit.nextVisitTime}`}
                                </p>
                              )}
                              {visit.address && (
                                <button
                                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visit.address)}`, '_blank')}
                                  className="flex items-center gap-1 mt-0.5"
                                >
                                  <MapPin className="h-2.5 w-2.5 text-primary" />
                                  <span className="text-[10px] text-primary hover:underline truncate">{visit.address}</span>
                                </button>
                              )}
                              {/* Visit history summary */}
                              {(visit.visitHistory?.length || 0) > 0 && (
                                <p className="text-[9px] text-muted-foreground mt-0.5">
                                  {visit.visitHistory!.length} naka-record na bisita
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Scheduled Visits */}
                {scheduledVisits.length > 0 && (
                  <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Naka-iskedyul na Bisita</p>
                    </div>
                    <div className="space-y-2">
                      {scheduledVisits.map(visit => {
                        const daysSince = visit.lastVisitDate
                          ? Math.floor((Date.now() - new Date(visit.lastVisitDate + 'T12:00:00').getTime()) / 86400000)
                          : null;
                        return (
                          <div key={visit.id} className="flex items-start gap-2.5 rounded-lg bg-background/80 p-2.5">
                            <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-foreground">{visit.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {visit.type === 'bible-study' ? 'BS' : 'RV'}
                                {daysSince !== null && ` · ${daysSince}d ago`}
                                {' · '}
                                {new Date(visit.nextVisitDate! + 'T12:00:00').toLocaleDateString()}
                                {visit.nextVisitTime && ` ${visit.nextVisitTime}`}
                              </p>
                              {visit.address && (
                                <button
                                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visit.address)}`, '_blank')}
                                  className="flex items-center gap-1 mt-0.5"
                                >
                                  <MapPin className="h-2.5 w-2.5 text-primary" />
                                  <span className="text-[10px] text-primary hover:underline truncate">{visit.address}</span>
                                </button>
                              )}
                              {(visit.visitHistory?.length || 0) > 0 && (
                                <p className="text-[9px] text-muted-foreground mt-0.5">
                                  {visit.visitHistory!.length} naka-record na bisita
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Verse Link</p>
                    <button
                      onClick={() => window.open(quickLinkUrl, '_blank')}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/60 bg-background border border-border"
                    >
                      <BookOpen className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs font-medium text-foreground flex-1 truncate">Buksan sa WOL</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
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
