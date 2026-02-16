import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { t } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BookOpen, CalendarDays, BarChart3, MessageSquare,
  Settings, Highlighter, FileText, Search, Bell, Wifi,
  Megaphone, Users, Download
} from 'lucide-react';

const howToSections = {
  en: [
    {
      icon: CalendarDays,
      title: 'Reading Plans',
      content: `**Selecting a Plan:** Go to the Plans tab and choose from Canonical, Chronological, Writing Order, or New Testament First.

**Reading Speed:** Adjust how many chapters per day (1, 2, or 3) to set a 1-year, 2-year, or 3-year completion pace.

**Today's Reading:** The Home page shows your next unread chapters based on your selected plan and speed.`,
    },
    {
      icon: BookOpen,
      title: 'Bible Reader',
      content: `**Navigate Books & Chapters:** Tap the Bible tab, choose Hebrew or Greek Scriptures, select a book, then tap a chapter number.

**Swipe Navigation:** Swipe left/right on the reader to move between chapters.

**Mark as Read:** Tap the "Mark Read" button at the top to track your progress.

**Verse Bookmarking:** Tap any verse number to open a bookmark dialog where you can save the verse with a note and color.`,
    },
    {
      icon: BarChart3,
      title: 'Home & Progress',
      content: `**Home Overview:** See overall progress, weekly chart, reading statistics, and ministry summary at a glance.

**Pioneer Summary:** The Home page shows a real-time Pioneer summary card with monthly hours and successful visits.

**Progress Page:** View detailed progress by book, weekly calendar, and upcoming visit reminders. On tablets/desktop, a two-column layout is used.

**Statistics:** Chapters completed, average daily reading time, and plan adherence are tracked automatically.`,
    },
    {
      icon: MessageSquare,
      title: 'Footnotes & Cross-References',
      content: `**Inline Markers:** Look for asterisk (*) markers in the Bible text — these indicate footnotes.

**View Footnotes:** Tap any * marker to auto-scroll the footnotes panel and highlight the reference.

**Expand Panel:** Tap the "Footnotes & Cross-References" bar to expand or collapse the full list.`,
    },
    {
      icon: Megaphone,
      title: 'Pioneer Tracking',
      content: `**Log Ministry Hours:** Use the Pioneer tab to log hours in 0.5h increments across five categories: Field Service, Bible Study, Return Visit, Public Witnessing, and Others.

**Monthly Summary:** View total hours, breakdowns, and priority indicators for each category.

**Service Year Target:** Set and track your annual hour goal with pace indicators.`,
    },
    {
      icon: Users,
      title: 'Bible Studies & Return Visits',
      content: `**Add Entries:** Track Bible studies and return visits with name, contact info, address, and scheduling.

**Visit History:** Log each visit with success status (Matagumpay / Hindi Matagumpay).

**Next Visit Scheduling:** Set date and time for the next visit. Upcoming visits appear on the Progress page.

**Google Maps:** Tap any address to open it directly in Google Maps.`,
    },
    {
      icon: Settings,
      title: 'Settings & Themes',
      content: `**Design Themes:** Choose from Bento, Glassmorphic, Soft Minimalist, or Cottagecore themes.

**Dark/Light Mode:** Toggle between dark and light modes.

**Font Size:** Adjust Bible text size (12–24px) with the slider.

**Reset Progress:** Clear all reading progress, pioneer entries, and data.`,
    },
    {
      icon: Highlighter,
      title: 'Highlights & Bookmarks',
      content: `**Highlighting Verses:** Long-press or select text in the Bible reader, then choose a highlight color (yellow, green, blue, red, or violet).

**Bookmarks Tab:** All saved bookmarks appear on the Bookmarks page, organized by date with notes and colors.`,
    },
    {
      icon: Search,
      title: 'Search',
      content: `**Search the Bible:** Use the Search tab to find keywords and phrases across all 66 books.

**Results:** Results show the book, chapter, and matching text. Tap any result to jump directly to that chapter.`,
    },
    {
      icon: Bell,
      title: 'Daily Reading Reminder',
      content: `**Enable Reminders:** Turn on daily reading reminders in Settings → Notifications.

**Set Time:** Choose your preferred reminder time. The app checks every 30 seconds and sends a notification once per day.

**Browser Permission:** Notifications require browser permission. If blocked, enable in your browser settings.`,
    },
    {
      icon: Download,
      title: 'Backup & Restore',
      content: `**Export Data:** Go to Settings → Backup and tap "I-export" to download a .nwt backup file with all your data.

**Import Data:** Tap "I-import" and select a .nwt or .json backup file to restore your data.

**What's Included:** Reading progress, bookmarks, highlights, journal entries, pioneer data, studies, theme settings, and reminder preferences.`,
    },
    {
      icon: Wifi,
      title: 'Offline Support',
      content: `**Fully Offline:** The app works without internet. All Bible text is bundled.

**Local Storage:** All data is stored on your device. No account needed.`,
    },
  ],
  tg: [
    {
      icon: CalendarDays,
      title: 'Mga Plano sa Pagbabasa',
      content: `**Pagpili ng Plano:** Pumunta sa Plans tab at pumili mula sa Canonical, Chronological, Writing Order, o New Testament First.

**Bilis ng Pagbabasa:** I-adjust kung ilang kabanata bawat araw (1, 2, o 3) para sa 1-taon, 2-taon, o 3-taong plano.

**Pagbabasa Ngayon:** Makikita sa Home page ang mga susunod na kabanata batay sa iyong plano at bilis.`,
    },
    {
      icon: BookOpen,
      title: 'Bible Reader',
      content: `**Mag-navigate ng Aklat at Kabanata:** I-tap ang Bible tab, pumili ng Hebreo o Griegong Kasulatan, pumili ng aklat, pagkatapos i-tap ang numero ng kabanata.

**Swipe Navigation:** Mag-swipe pakaliwa/pakanan sa reader para lumipat ng kabanata.

**Markahan bilang Nabasa:** I-tap ang "Markahan bilang Nabasa" button sa itaas para ma-track ang progreso.

**Pag-bookmark ng Talata:** I-tap ang anumang numero ng talata para mag-save ng bookmark na may tala at kulay.`,
    },
    {
      icon: BarChart3,
      title: 'Home at Progreso',
      content: `**Home Overview:** Makikita ang kabuuang progreso, weekly chart, reading statistics, at ministry summary sa isang tingin.

**Pioneer Summary:** Nagpapakita ang Home page ng real-time Pioneer summary card na may monthly hours at matagumpay na bisita.

**Progress Page:** Makikita ang detalyadong progreso ayon sa aklat, weekly calendar, at mga upcoming visit reminder. Sa tablet/desktop, dalawang kolum ang layout.

**Istatistika:** Awtomatikong sinusubaybayan ang mga kabanata, average daily reading time, at pagsunod sa plano.`,
    },
    {
      icon: MessageSquare,
      title: 'Mga Footnote at Cross-Reference',
      content: `**Inline Markers:** Hanapin ang asterisk (*) markers sa Bible text — ito ay nagpapahiwatig ng footnotes.

**Tingnan ang Footnotes:** I-tap ang anumang * marker para ma-auto-scroll ang footnotes panel at ma-highlight ang kaukulang reference.

**I-expand ang Panel:** I-tap ang "Mga Footnote at Cross-Reference" bar sa ibaba ng teksto para i-expand o i-collapse.`,
    },
    {
      icon: Megaphone,
      title: 'Pioneer Tracking',
      content: `**Mag-log ng Oras:** Gamitin ang Pioneer tab para mag-log ng oras sa 0.5h increments sa limang kategorya: Field Service, Bible Study, Return Visit, Public Witnessing, at Others.

**Buod ng Buwan:** Tingnan ang kabuuang oras, breakdown, at priority indicators sa bawat kategorya.

**Target ng Taon ng Serbisyo:** Itakda at subaybayan ang iyong taunang target na oras.`,
    },
    {
      icon: Users,
      title: 'Bible Study at Return Visit',
      content: `**Magdagdag ng Entry:** I-track ang Bible study at return visit na may pangalan, contact info, address, at schedule.

**Kasaysayan ng Bisita:** I-log ang bawat bisita na may status (Matagumpay / Hindi Matagumpay).

**Susunod na Bisita:** Itakda ang petsa at oras ng susunod na bisita. Ang mga upcoming visits ay makikita sa Progress page.

**Google Maps:** I-tap ang anumang address para buksan ito sa Google Maps.`,
    },
    {
      icon: Settings,
      title: 'Mga Setting at Tema',
      content: `**Mga Design Theme:** Pumili mula sa Bento, Glassmorphic, Soft Minimalist, o Cottagecore na tema.

**Dark/Light Mode:** I-toggle sa pagitan ng dark at light mode.

**Laki ng Font:** I-adjust ang laki ng teksto ng Bibliya (12–24px) gamit ang slider.

**I-reset ang Progreso:** I-clear ang lahat ng reading progress, pioneer entries, at data.`,
    },
    {
      icon: Highlighter,
      title: 'Mga Highlight at Bookmark',
      content: `**Pag-highlight ng Talata:** Pindutin nang matagal o pumili ng teksto sa Bible reader, pagkatapos pumili ng kulay ng highlight (dilaw, berde, asul, pula, o violet).

**Bookmarks Tab:** Makikita ang lahat ng na-save na bookmark sa Bookmarks page, nakaayos ayon sa petsa na may mga tala at kulay.`,
    },
    {
      icon: Search,
      title: 'Paghahanap',
      content: `**Maghanap sa Bibliya:** Gamitin ang Search tab para maghanap ng mga keyword at parirala sa lahat ng 66 na aklat.

**Mga Resulta:** Makikita ang aklat, kabanata, at tumutugmang teksto. I-tap ang anumang resulta para diretso pumunta sa kabanata.`,
    },
    {
      icon: Bell,
      title: 'Paalala sa Pagbabasa',
      content: `**I-enable ang Reminders:** I-on ang daily reading reminders sa Settings → Notifications.

**Itakda ang Oras:** Pumili ng gustong oras ng paalala. Nagche-check ang app tuwing 30 segundo at nagpapadala ng notipikasyon isang beses bawat araw.

**Suporta ng Browser:** Kailangan ng browser permission ang mga notipikasyon. Kung naka-block, i-enable sa browser settings.`,
    },
    {
      icon: Download,
      title: 'Backup at Restore',
      content: `**I-export ang Data:** Pumunta sa Settings → Backup at i-tap ang "I-export" para mag-download ng .nwt backup file na may lahat ng data.

**I-import ang Data:** I-tap ang "I-import" at pumili ng .nwt o .json backup file para i-restore ang iyong data.

**Ano ang Kasama:** Reading progress, bookmark, highlight, journal entry, pioneer data, studies, theme settings, at reminder preferences.`,
    },
    {
      icon: Wifi,
      title: 'Offline Support',
      content: `**Ganap na Offline:** Gumagana ang app kahit walang internet. Lahat ng teksto ng Bibliya ay naka-bundle.

**Lokal na Storage:** Lahat ng data ay naka-store sa iyong device. Hindi kailangan ng account.`,
    },
  ],
};

export default function HowToPage() {
  const { language } = useReadingProgress();
  const sections = language === 'en' ? howToSections.en : howToSections.tg;

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title={t('howto.title', language)}
        subtitle={t('howto.subtitle', language)}
        showBack
      />

      <div className="px-4 pt-4 max-w-4xl mx-auto">
        <Accordion type="multiple" className="space-y-2">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <AccordionItem
                key={idx}
                value={`section-${idx}`}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground text-left">
                      {section.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {renderMarkdownLite(section.content)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}

function renderMarkdownLite(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}
