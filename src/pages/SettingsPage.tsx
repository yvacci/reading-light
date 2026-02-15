import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Type, RotateCcw, Bell, Clock, HelpCircle, CalendarDays, Download, FolderInput, ChevronRight, Info, Moon, Sun } from 'lucide-react';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useReminderNotifications } from '@/hooks/useReminderNotifications';
import { usePioneer } from '@/contexts/PioneerContext';
import { exportBackup, importBackup } from '@/lib/backup-service';
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
  const { fontSize, setFontSize, language, darkMode, setDarkMode, resetProgress } = useReadingProgress();
  const { resetEntries } = usePioneer();
  const {
    isSupported,
    permissionState,
    enabled: remindersEnabled,
    reminderTime,
    enableReminders,
    disableReminders,
    setReminderTime,
  } = useReminderNotifications();

  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleReminderToggle = async (checked: boolean) => {
    if (checked) {
      await enableReminders();
    } else {
      disableReminders();
    }
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

  const handleFullReset = () => {
    resetProgress();
    resetEntries();
    toast.success('Na-reset ang lahat ng data.');
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
            <div className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                <span className="text-sm text-foreground">Dark Mode</span>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
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
                    <p className="text-[10px] text-muted-foreground">I-reset ang Home, Bible, at Pioneer data</p>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.resetConfirm', language)}</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ire-reset nito ang reading progress, pioneer entries, at iba pang data. Hindi na ito maibabalik.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel', language)}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleFullReset}
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
              <p className="text-[10px] text-muted-foreground">Version 2.2.0</p>
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
