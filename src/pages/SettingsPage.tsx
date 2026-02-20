import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Type, RotateCcw, Bell, Clock, HelpCircle, CalendarDays, Download, FolderInput, ChevronRight, Info, Moon, Sun, Palette, Grid3X3, Sparkles, Leaf, Home, Check } from 'lucide-react';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useTheme, THEME_OPTIONS, type ThemeName } from '@/contexts/ThemeContext';
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

const themeIcons: Record<ThemeName, React.ElementType> = {
  bento: Grid3X3,
  glassmorphic: Sparkles,
  'soft-minimalist': Leaf,
  cottagecore: Home,
  classic: Type,
  monochrome: Moon,
};

const themePreviewColors: Record<ThemeName, { bg: string; accent: string }> = {
  bento: { bg: 'bg-blue-50 dark:bg-slate-800', accent: 'bg-blue-500' },
  glassmorphic: { bg: 'bg-purple-50 dark:bg-purple-900/40', accent: 'bg-purple-400' },
  'soft-minimalist': { bg: 'bg-amber-50 dark:bg-stone-800', accent: 'bg-emerald-500' },
  cottagecore: { bg: 'bg-orange-50 dark:bg-stone-800', accent: 'bg-green-700' },
  classic: { bg: 'bg-amber-50 dark:bg-slate-800', accent: 'bg-blue-700' },
  monochrome: { bg: 'bg-gray-100 dark:bg-gray-900', accent: 'bg-gray-900 dark:bg-gray-100' },
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { fontSize, setFontSize, language, resetProgress } = useReadingProgress();
  const { theme, mode, setTheme, toggleMode } = useTheme();
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

  const sectionClass = "bg-transparent p-0 mb-6";

  return (
    <div className="min-h-screen pb-20">
      <div className="px-5 pt-12 pb-4 safe-top">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{t('settings.title', language)}</p>
        <h1 className="mt-1.5 text-2xl font-bold text-foreground tracking-tight ghibli-heading">
          {t('settings.subtitle', language)}
        </h1>
      </div>

      <div className="px-5 max-w-4xl mx-auto md:grid md:grid-cols-2 md:gap-6">
        {/* LEFT COLUMN */}
        <div>
          {/* Theme & Design */}
          <div className={sectionClass}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Theme & Design</p>

            {/* Light/Dark toggle */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {mode === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                <span className="text-sm text-foreground">{mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <Switch checked={mode === 'dark'} onCheckedChange={toggleMode} />
            </div>

            {/* Theme selector */}
            <div className="pt-2 border-t border-border/40">
              <div className="flex items-center gap-3 mb-3 pt-2">
                <Palette className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">Design Theme</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {THEME_OPTIONS.map((opt) => {
                  const isActive = theme === opt.id;
                  const Icon = themeIcons[opt.id];
                  const colors = themePreviewColors[opt.id];
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      className={`relative flex items-center gap-3 rounded-xl p-3 transition-all ${
                        isActive
                          ? 'bg-primary/5'
                          : 'hover:bg-muted/40'
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${colors.bg}`}>
                        <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-foreground/50'}`} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                            {opt.name}
                          </span>
                          <div className={`h-1.5 w-5 rounded-full ${colors.accent}`} />
                        </div>
                        <span className="text-[10px] text-muted-foreground leading-tight">{opt.description}</span>
                      </div>
                      {isActive && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className={sectionClass}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">{t('settings.appearance', language)}</p>
            <div className="py-2">
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

        {/* RIGHT COLUMN */}
        <div>
          {/* Notifications */}
          <div className={sectionClass}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">{t('settings.notifications', language)}</p>
            <div className="flex items-center justify-between py-2">
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
              <div className="flex items-center gap-3 py-2 mt-1 border-t border-border/40">
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

          {/* Quick Links */}
          <div className={sectionClass}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Mga Link</p>
            <button
              onClick={() => navigate('/plans')}
              className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:opacity-70"
            >
              <CalendarDays className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground flex-1">{t('plans.title', language)}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate('/how-to')}
              className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:opacity-70 border-t border-border/40"
            >
              <HelpCircle className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground flex-1">{t('settings.howTo', language)}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Backup & Restore */}
          <div className={sectionClass}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">{t('settings.backup', language)}</p>
            <div className="py-2">
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
                accept=".nwt,.json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </div>
          </div>

          {/* Data */}
          <div className={sectionClass}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">{t('settings.data', language)}</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex w-full items-center gap-3 py-2 text-left transition-colors hover:opacity-70">
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

          {/* About */}
          <div className={sectionClass + ' mb-10'}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">{t('settings.about', language)}</p>
            <div className="flex items-start gap-3 py-2">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{t('app.title', language)}</p>
                <p className="text-[10px] text-muted-foreground">Version 3.0.0</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('settings.aboutDesc', language)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
