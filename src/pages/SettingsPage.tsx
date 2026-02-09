import { useState } from 'react';
import { Moon, Sun, Type, Globe, RotateCcw, Bell, Clock } from 'lucide-react';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useReminderNotifications } from '@/hooks/useReminderNotifications';
import PageHeader from '@/components/PageHeader';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
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

  const handleReminderToggle = async (checked: boolean) => {
    if (checked) {
      await enableReminders();
    } else {
      disableReminders();
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="Settings" subtitle="Customize your experience" />

      <div className="space-y-6 px-4 pt-4">
        {/* Appearance */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appearance</h2>
          <div className="space-y-1 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
                <span className="text-sm font-medium text-foreground">Dark Mode</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center gap-3 mb-2">
                <Type className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Font Size</span>
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
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Language</h2>
          <div className="space-y-1 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3 px-4 py-3">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Bible Language</span>
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

        {/* Notifications */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifications</h2>
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-sm font-medium text-foreground">Daily Reading Reminder</span>
                  {!isSupported && (
                    <p className="text-[10px] text-muted-foreground">Not supported in this browser</p>
                  )}
                  {isSupported && permissionState === 'denied' && (
                    <p className="text-[10px] text-destructive">Notifications blocked. Enable in browser settings.</p>
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
                  <span className="text-sm font-medium text-foreground">Reminder Time</span>
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
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data</h2>
          <div className="rounded-2xl border border-border bg-card">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 rounded-2xl">
                  <RotateCcw className="h-4 w-4 text-destructive" />
                  <div>
                    <span className="text-sm font-medium text-destructive">Reset Progress</span>
                    <p className="text-[10px] text-muted-foreground">Clear all reading progress and time data</p>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently clear all your reading progress, chapter marks, and reading time data. 
                    Your plan selection, language preference, and appearance settings will be preserved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={resetProgress}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Reset Progress
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</h2>
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-sm font-medium text-foreground">NWT Reading Planner</p>
            <p className="text-xs text-muted-foreground">Version 1.2.0</p>
            <p className="mt-2 text-xs text-muted-foreground">
              A Bible reading planner for the New World Translation. All data is stored locally on your device.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
