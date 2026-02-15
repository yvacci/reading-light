import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, BookOpen, Users, Trash2, Edit2, Phone, Calendar, FileText, MapPin, ExternalLink } from 'lucide-react';
import { useStudies, StudyEntry } from '@/contexts/StudiesContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { t } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function StudiesPage() {
  const { language } = useReadingProgress();
  const { studies, addStudy, updateStudy, deleteStudy } = useStudies();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'bible-study' | 'return-visit'>('all');
  const [form, setForm] = useState({
    name: '', contactInfo: '', address: '', lastVisitDate: '', notes: '', type: 'bible-study' as 'bible-study' | 'return-visit',
  });

  const openNew = () => {
    setEditingId(null);
    setForm({ name: '', contactInfo: '', address: '', lastVisitDate: new Date().toISOString().slice(0, 10), notes: '', type: 'bible-study' });
    setDialogOpen(true);
  };

  const openEdit = (s: StudyEntry) => {
    setEditingId(s.id);
    setForm({ name: s.name, contactInfo: s.contactInfo, address: s.address || '', lastVisitDate: s.lastVisitDate, notes: s.notes, type: s.type });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateStudy(editingId, form);
    } else {
      addStudy(form);
    }
    setDialogOpen(false);
  };

  const openInMaps = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
  };

  const filtered = studies.filter(s => {
    if (filterType !== 'all' && s.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.notes.toLowerCase().includes(q) || (s.address || '').toLowerCase().includes(q);
    }
    return true;
  });

  const bsCount = studies.filter(s => s.type === 'bible-study').length;
  const rvCount = studies.filter(s => s.type === 'return-visit').length;

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title={t('studies.title', language)} subtitle={t('studies.subtitle', language)} />

      <div className="space-y-4 px-4 pt-4">
        {/* Summary chips */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">{bsCount} {t('studies.bibleStudies', language)}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5">
            <Users className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-semibold text-accent">{rvCount} {t('studies.returnVisits', language)}</span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('studies.searchPlaceholder', language)}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-xl"
            />
          </div>
          <Button onClick={openNew} size="sm" className="rounded-xl gap-1.5">
            <Plus className="h-4 w-4" />
            {t('studies.add', language)}
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          {(['all', 'bible-study', 'return-visit'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-all ${
                filterType === type ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {type === 'all' ? t('studies.all', language) : type === 'bible-study' ? t('studies.bibleStudy', language) : t('studies.returnVisit', language)}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('studies.empty', language)}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((s, i) => {
              const daysSince = s.lastVisitDate
                ? Math.floor((Date.now() - new Date(s.lastVisitDate + 'T12:00:00').getTime()) / 86400000)
                : null;
              const needsFollowUp = daysSince !== null && daysSince >= 7;

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`rounded-2xl border bg-card p-3 ${needsFollowUp ? 'border-destructive/30' : 'border-border'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          s.type === 'bible-study' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                        }`}>
                          {s.type === 'bible-study' ? t('studies.bibleStudy', language) : t('studies.returnVisit', language)}
                        </span>
                        {needsFollowUp && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                            {daysSince}d ago
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground mt-1">{s.name}</p>
                      {s.contactInfo && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">{s.contactInfo}</span>
                        </div>
                      )}
                      {s.address && (
                        <button
                          onClick={() => openInMaps(s.address)}
                          className="flex items-center gap-1 mt-0.5 group"
                        >
                          <MapPin className="h-3 w-3 text-primary" />
                          <span className="text-[11px] text-primary group-hover:underline">{s.address}</span>
                          <ExternalLink className="h-2.5 w-2.5 text-primary/60" />
                        </button>
                      )}
                      {s.lastVisitDate && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">{new Date(s.lastVisitDate + 'T12:00:00').toLocaleDateString()}</span>
                        </div>
                      )}
                      {s.notes && (
                        <div className="flex items-start gap-1 mt-1">
                          <FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
                          <span className="text-[11px] text-muted-foreground line-clamp-2">{s.notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('common.delete', language)}?</AlertDialogTitle>
                            <AlertDialogDescription>{t('studies.deleteConfirm', language)}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel', language)}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteStudy(s.id)} className="bg-destructive text-destructive-foreground">
                              {t('common.delete', language)}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {editingId ? t('studies.edit', language) : t('studies.addNew', language)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              <button
                onClick={() => setForm(p => ({ ...p, type: 'bible-study' }))}
                className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-all ${
                  form.type === 'bible-study' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {t('studies.bibleStudy', language)}
              </button>
              <button
                onClick={() => setForm(p => ({ ...p, type: 'return-visit' }))}
                className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-all ${
                  form.type === 'return-visit' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {t('studies.returnVisit', language)}
              </button>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('studies.name', language)}</label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-9" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('studies.contact', language)}</label>
              <Input value={form.contactInfo} onChange={e => setForm(p => ({ ...p, contactInfo: e.target.value }))} className="h-9" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Address</label>
              <Input
                value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                className="h-9"
                placeholder="e.g. 123 Main St, City"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('studies.lastVisit', language)}</label>
              <Input type="date" value={form.lastVisitDate} onChange={e => setForm(p => ({ ...p, lastVisitDate: e.target.value }))} className="h-9" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('studies.notes', language)}</label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="min-h-[60px]" />
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
              {t('common.cancel', language)}
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={!form.name.trim()}>
              {t('common.save', language)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
