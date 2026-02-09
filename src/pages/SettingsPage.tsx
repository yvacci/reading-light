import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Type, Globe, RotateCcw, Bell, Clock, Upload, FileText, Trash2, HelpCircle } from 'lucide-react';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useReminderNotifications } from '@/hooks/useReminderNotifications';
import { saveUserUploadedFile, clearUserUploadedFile, getDailyTextEntryCount } from '@/lib/daily-text-service';
import { t } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';
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
  const { darkMode, setDarkMode, fontSize, setFontSize, language, setLanguage, resetProgress } = useReadingProgress();
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
  const [dailyTextCount, setDailyTextCount] = useState(() => getDailyTextEntryCount());
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (ext !== '.epub') {
      toast.error(language === 'en' ? 'Please upload an EPUB file' : 'Mag-upload ng EPUB file');
      return;
    }

    setUploading(true);
    try {
      const count = await saveUserUploadedFile(file);
      setDailyTextCount(count);
      toast.success(`${language === 'en' ? 'Daily text uploaded!' : 'Na-upload ang daily text!'} ${count} entries.`);
    } catch (err) {
      console.error('[Settings] Upload error:', err);
      toast.error(language === 'en' ? 'Could not parse the file.' : 'Hindi ma-parse ang file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearDailyText = async () => {
    await clearUserUploadedFile();
    setDailyTextCount(0);
    toast.success(language === 'en' ? 'Custom daily text removed.' : 'Inalis ang custom daily text.');
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title={t('settings.title', language)} subtitle={t('settings.subtitle', language)} />

      <div className="space-y-6 px-4 pt-4">
        {/* Appearance */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('settings.appearance', language)}</h2>
          <div className="space-y-1 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
                <span className="text-sm font-medium text-foreground">{t('settings.darkMode', language)}</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center gap-3 mb-2">
                <Type className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{t('settings.fontSize', language)}</span>
                <span className="ml-auto text-xs text-muted-foreground">{fontSize}px</span>
              </div>
              <Slider
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
                min={12}
                max={24}
                step={1}
                className="mt-1"
              />
            </div>
          </div>
        </section>

        {/* Language */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('settings.language', language)}</h2>
          <div className="space-y-1 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3 px-4 py-3">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{t('settings.bibleLanguage', language)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
              {[
                { code: 'tg', label: 'Tagalog' },
                { code: 'en', label: 'English' },
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    language === lang.code
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Daily Text Upload */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('settings.dailyText', language)}</h2>
          <div className="rounded-2xl border border-border bg-card">
            <div className="px-4 py-3">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground">{t('settings.dailyTextFile', language)}</span>
                  <p className="text-[10px] text-muted-foreground">
                    {dailyTextCount > 0
                      ? `${dailyTextCount} ${t('settings.entriesLoaded', language)}`
                      : t('settings.usingBundled', language)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? t('settings.uploading', language) : t('settings.uploadEpub', language)}
                </button>

                {dailyTextCount > 0 && (
                  <button
                    onClick={handleClearDailyText}
                    className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t('settings.remove', language)}
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".epub"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('settings.notifications', language)}</h2>
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-sm font-medium text-foreground">{t('settings.dailyReminder', language)}</span>
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
              <div className="border-t border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{t('settings.reminderTime', language)}</span>
                  <Input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="ml-auto w-28 text-sm h-8 rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Data */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('settings.data', language)}</h2>
          <div className="rounded-2xl border border-border bg-card">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 rounded-2xl">
                  <RotateCcw className="h-4 w-4 text-destructive" />
                  <div>
                    <span className="text-sm font-medium text-destructive">{t('settings.resetProgress', language)}</span>
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
        </section>

        {/* How-to Guide */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('settings.howTo', language)}</h2>
          <div className="rounded-2xl border border-border bg-card">
            <button
              onClick={() => navigate('/how-to')}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 rounded-2xl"
            >
              <HelpCircle className="h-4 w-4 text-primary" />
              <div>
                <span className="text-sm font-medium text-foreground">{t('settings.howTo', language)}</span>
                <p className="text-[10px] text-muted-foreground">{t('settings.howToDesc', language)}</p>
              </div>
            </button>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('settings.about', language)}</h2>
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-sm font-medium text-foreground">{t('app.title', language)}</p>
            <p className="text-xs text-muted-foreground">Version 1.5.0</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('settings.aboutDesc', language)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
