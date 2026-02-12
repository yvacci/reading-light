import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Type, RotateCcw, Bell, Clock, Upload, FileText, Trash2, HelpCircle, CalendarDays, Download, FolderInput, ChevronRight, Info, BookOpen } from 'lucide-react';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useReminderNotifications } from '@/hooks/useReminderNotifications';
import { saveUserUploadedFile, clearUserUploadedFile, getDailyTextEntryCount } from '@/lib/daily-text-service';
import { exportBackup, importBackup } from '@/lib/backup-service';
import { parseBiblePdf, parseBibleEpub, saveCustomSections, clearCustomSections, getCustomSectionCount } from '@/lib/epub-sections';
import { t } from '@/lib/i18n';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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

export default function SettingsPage() {
  const navigate = useNavigate();
  const { fontSize, setFontSize, language, resetProgress } = useReadingProgress();
  const {
    isSupported,
    permissionState,
    enabled: remindersEnabled,
    reminderTime,
    enableReminders,
    disableReminders,
    setReminderTime,
  } = useReminderNotifications();

  const [uploading, setUploading] = useState(false);
  const [uploadingBible, setUploadingBible] = useState(false);
  const [dailyTextCount, setDailyTextCount] = useState(() => getDailyTextEntryCount());
  const [bibleSectionCount, setBibleSectionCount] = useState(() => getCustomSectionCount());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bibleFileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleReminderToggle = async (checked: boolean) => {
    if (checked) {
      await enableReminders();
    } else {
      disableReminders();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (ext !== '.pdf') {
      toast.error('Mag-upload ng PDF file');
      return;
    }

    setUploading(true);
    try {
      const count = await saveUserUploadedFile(file);
      setDailyTextCount(count);
      toast.success(`Na-upload ang daily text! ${count} entries.`);
    } catch (err) {
      console.error('[Settings] Upload error:', err);
      toast.error('Hindi ma-parse ang file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBibleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (ext !== '.pdf' && ext !== '.epub') {
      toast.error('Mag-upload ng PDF o EPUB file');
      return;
    }

    setUploadingBible(true);
    try {
      let sections: Record<string, any>;
      if (ext === '.pdf') {
        sections = await parseBiblePdf(file);
      } else {
        sections = await parseBibleEpub(file);
      }

      const count = Object.keys(sections).length;
      if (count === 0) {
        toast.error('Walang nahanap na seksyon (Introduksiyon, Indise, Apendise).');
      } else {
        saveCustomSections(sections);
        setBibleSectionCount(count);
        toast.success(`Na-parse ang ${count} seksyon mula sa Bible file!`);
      }
    } catch (err) {
      console.error('[Settings] Bible upload error:', err);
      toast.error('Hindi ma-parse ang file.');
    } finally {
      setUploadingBible(false);
      if (bibleFileInputRef.current) bibleFileInputRef.current.value = '';
    }
  };

  const handleClearBibleSections = () => {
    clearCustomSections();
    setBibleSectionCount(0);
    toast.success('Inalis ang custom Bible sections.');
  };

  const handleClearDailyText = async () => {
    await clearUserUploadedFile();
    setDailyTextCount(0);
    toast.success('Inalis ang custom daily text.');
  };

  const handleExportBackup = () => {
    try {
      exportBackup();
      toast.success('Na-export ang backup!');
    } catch (err) {
      toast.error('Nabigo ang pag-export.');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importBackup(file);
      toast.success(`Na-restore ang backup! ${count} keys.`);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error('Hindi valid ang backup file.');
    } finally {
      if (backupInputRef.current) backupInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="px-5 pt-12 pb-4 safe-top">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">{t('settings.title', language)}</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">{t('settings.subtitle', language)}</h1>
      </div>

      <div className="px-5 max-w-lg mx-auto">
        {/* Appearance */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">{t('settings.appearance', language)}</p>
          <div className="space-y-0 divide-y divide-border">
            <div className="py-3.5">
              <div className="flex items-center gap-3 mb-3">
                <Type className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">{t('settings.fontSize', language)}</span>
                <span className="ml-auto text-xs text-muted-foreground">{fontSize}px</span>
              </div>
              <Slider
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
                min={12}
                max={24}
                step={1}
              />
            </div>
          </div>
        </div>

        {/* Daily Text Upload */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">{t('settings.dailyText', language)}</p>
          <div className="space-y-0 divide-y divide-border">
            <div className="py-3.5">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <span className="text-sm text-foreground">{t('settings.dailyTextFile', language)}</span>
                  <p className="text-[10px] text-muted-foreground">
                    {dailyTextCount > 0
                      ? `${dailyTextCount} ${t('settings.entriesLoaded', language)}`
                      : t('settings.usingBundled', language)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 ml-8">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? t('settings.uploading', language) : t('settings.uploadEpub', language)}
                </button>
                {dailyTextCount > 0 && (
                  <button
                    onClick={handleClearDailyText}
                    className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t('settings.remove', language)}
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Bible Sections Upload */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Bible Sections</p>
          <div className="space-y-0 divide-y divide-border">
            <div className="py-3.5">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <span className="text-sm text-foreground">I-upload ang Bible PDF/EPUB</span>
                  <p className="text-[10px] text-muted-foreground">
                    {bibleSectionCount > 0
                      ? `${bibleSectionCount} seksyon na-parse (Intro, Indise, Apendise)`
                      : 'I-parse ang Introduksiyon, Indise, at Apendise mula sa file'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 ml-8">
                <button
                  onClick={() => bibleFileInputRef.current?.click()}
                  disabled={uploadingBible}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingBible ? 'Nag-pa-parse...' : 'I-upload ang PDF/EPUB'}
                </button>
                {bibleSectionCount > 0 && (
                  <button
                    onClick={handleClearBibleSections}
                    className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Alisin
                  </button>
                )}
              </div>
              <input
                ref={bibleFileInputRef}
                type="file"
                accept=".pdf,.epub"
                onChange={handleBibleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">{t('settings.notifications', language)}</p>
          <div className="space-y-0 divide-y divide-border">
            <div className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-sm text-foreground">{t('settings.dailyReminder', language)}</span>
                  {!isSupported && (
                    <p className="text-[10px] text-muted-foreground">{t('settings.notSupported', language)}</p>
                  )}
                  {isSupported && permissionState === 'denied' && (
                    <p className="text-[10px] text-destructive">{t('settings.blocked', language)}</p>
                  )}
                </div>
              </div>
              <Switch
                checked={remindersEnabled}
                onCheckedChange={handleReminderToggle}
                disabled={!isSupported || permissionState === 'denied'}
              />
            </div>
            {remindersEnabled && (
              <div className="flex items-center gap-3 py-3.5">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">{t('settings.reminderTime', language)}</span>
                <Input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="ml-auto w-28 text-sm h-8 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Mga Link</p>
          <div className="space-y-0 divide-y divide-border">
            <button
              onClick={() => navigate('/plans')}
              className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:opacity-70"
            >
              <CalendarDays className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground flex-1">{t('plans.title', language)}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate('/how-to')}
              className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:opacity-70"
            >
              <HelpCircle className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground flex-1">{t('settings.howTo', language)}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">{t('settings.backup', language)}</p>
          <div className="space-y-0 divide-y divide-border">
            <div className="py-3.5">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <span className="text-sm text-foreground">{t('settings.backupRestore', language)}</span>
                  <p className="text-[10px] text-muted-foreground">{t('settings.backupDesc', language)}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 ml-8">
                <button
                  onClick={handleExportBackup}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  <Download className="h-3.5 w-3.5" />
                  {t('settings.export', language)}
                </button>
                <button
                  onClick={() => backupInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  <FolderInput className="h-3.5 w-3.5" />
                  {t('settings.import', language)}
                </button>
              </div>
              <input
                ref={backupInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">{t('settings.data', language)}</p>
          <div className="divide-y divide-border">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:opacity-70">
                  <RotateCcw className="h-5 w-5 text-destructive" />
                  <div className="flex-1">
                    <span className="text-sm text-destructive">{t('settings.resetProgress', language)}</span>
                    <p className="text-[10px] text-muted-foreground">{t('settings.resetDesc', language)}</p>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.resetConfirm', language)}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('settings.resetConfirmDesc', language)}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel', language)}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={resetProgress}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('settings.resetProgress', language)}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* About */}
        <div className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">{t('settings.about', language)}</p>
          <div className="flex items-start gap-3 py-3.5">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">{t('app.title', language)}</p>
              <p className="text-[10px] text-muted-foreground">Version 2.0.0</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('settings.aboutDesc', language)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
