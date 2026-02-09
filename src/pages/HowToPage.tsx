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
  Settings, Highlighter, FileText, Search, Bell, Wifi
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

**Mark as Read:** Tap the "Mark Read" button at the top to track your progress. Chapters you've read show as highlighted in the chapter grid.

**Verse Bookmarking:** Tap any verse number to open a bookmark dialog where you can save the verse with a note and color.`,
    },
    {
      icon: BarChart3,
      title: 'Home & Progress',
      content: `**Daily Text:** The top of the Home page shows the daily text for today's date. Tap verse references to see the full verse text.

**Progress Overview:** View your overall completion percentage, chapters completed, average reading time, and plan adherence.

**Weekly Chart:** The Home page includes a weekly reading activity chart showing minutes read each day.

**Progress Page:** Visit the Progress tab for detailed weekly calendar views with reading activity indicators.`,
    },
    {
      icon: MessageSquare,
      title: 'Footnotes & Cross-References',
      content: `**Inline Markers:** Look for asterisk (*) markers in the Bible text — these indicate footnotes.

**View Footnotes:** Tap any * marker to auto-scroll the footnotes panel at the bottom and highlight the corresponding reference.

**Expand Panel:** Tap the "Footnotes & Cross-References" bar below the text to expand or collapse the full list.`,
    },
    {
      icon: Settings,
      title: 'Settings',
      content: `**Language:** Switch between Tagalog and English. All text, book titles, and interface elements update immediately.

**Dark Mode:** Toggle dark/light theme for comfortable reading.

**Font Size:** Use the slider to adjust Bible text size (12–24px).

**Reset Progress:** Clear all reading progress and time data (plan selection and settings are preserved).`,
    },
    {
      icon: Highlighter,
      title: 'Highlights & Bookmarks',
      content: `**Highlighting Verses:** Long-press or select text in the Bible reader, then choose a highlight color (yellow, green, blue, red, or violet).

**Color Options:** Five soft colors ensure text remains readable over highlights.

**Bookmarks Tab:** All your saved bookmarks appear on the Bookmarks page, organized by date. You can add notes and change colors.`,
    },
    {
      icon: FileText,
      title: 'Daily Text Upload',
      content: `**Upload Custom File:** In Settings → Daily Text, tap "Upload EPUB" to load a custom yearly daily text file.

**Supported Format:** EPUB files with daily entries organized by date.

**Default Text:** If no custom file is uploaded, the app uses the bundled daily text matching your selected language.

**Remove Upload:** Tap "Remove" to revert to the bundled daily text.`,
    },
    {
      icon: Search,
      title: 'Search',
      content: `**Search the Bible:** Use the Search tab to find keywords and phrases across all 66 books.

**Results:** Results show the book, chapter, and matching text snippet. Tap any result to jump directly to that chapter.`,
    },
    {
      icon: Bell,
      title: 'Notifications',
      content: `**Daily Reminders:** Enable reading reminders in Settings → Notifications.

**Set Time:** Choose your preferred reminder time (e.g., 7:00 AM).

**Browser Support:** Notifications require browser permission. If blocked, enable in your browser settings.`,
    },
    {
      icon: Wifi,
      title: 'Offline Support',
      content: `**Fully Offline:** The app works without internet. All Bible text is bundled in the app.

**Local Storage:** Your reading progress, bookmarks, highlights, journal entries, and uploaded files are stored on your device.

**No Account Needed:** No sign-up or login required. Everything stays private on your device.`,
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
      content: `**Daily Text:** Makikita sa itaas ng Home page ang teksto para sa araw na ito. I-tap ang mga reference ng talata para makita ang buong teksto.

**Overview ng Progreso:** Tingnan ang kabuuang porsyento, nabasang kabanata, average reading time, at pagsunod sa plano.

**Weekly Chart:** May lingguhang chart ng pagbabasa sa Home page na nagpapakita ng minutong nagbasa bawat araw.

**Progress Page:** Bisitahin ang Progress tab para sa detalyadong weekly calendar views.`,
    },
    {
      icon: MessageSquare,
      title: 'Mga Footnote at Cross-Reference',
      content: `**Inline Markers:** Hanapin ang asterisk (*) markers sa Bible text — ito ay nagpapahiwatig ng footnotes.

**Tingnan ang Footnotes:** I-tap ang anumang * marker para ma-auto-scroll ang footnotes panel at ma-highlight ang kaukulang reference.

**I-expand ang Panel:** I-tap ang "Mga Footnote at Cross-Reference" bar sa ibaba ng teksto para i-expand o i-collapse.`,
    },
    {
      icon: Settings,
      title: 'Mga Setting',
      content: `**Wika:** Lumipat sa pagitan ng Tagalog at English. Lahat ng teksto, pamagat ng aklat, at interface ay mag-a-update agad.

**Dark Mode:** I-toggle ang dark/light theme para sa kumportableng pagbabasa.

**Laki ng Font:** Gamitin ang slider para i-adjust ang laki ng teksto (12–24px).

**I-reset ang Progreso:** I-clear ang lahat ng reading progress at time data (ang plan selection at settings ay mananatili).`,
    },
    {
      icon: Highlighter,
      title: 'Mga Highlight at Bookmark',
      content: `**Pag-highlight ng Talata:** Pindutin nang matagal o pumili ng teksto sa Bible reader, pagkatapos pumili ng kulay ng highlight (dilaw, berde, asul, pula, o violet).

**Mga Kulay:** Limang malambot na kulay para mananatiling nababasa ang teksto.

**Bookmarks Tab:** Makikita ang lahat ng na-save na bookmark sa Bookmarks page, nakaayos ayon sa petsa.`,
    },
    {
      icon: FileText,
      title: 'Pag-upload ng Daily Text',
      content: `**Mag-upload ng Custom File:** Sa Settings → Daily Text, i-tap ang "Mag-upload ng EPUB" para mag-load ng custom yearly daily text file.

**Suportadong Format:** EPUB files na may daily entries na nakaayos ayon sa petsa.

**Default Text:** Kung walang custom file, gagamit ang app ng bundled daily text batay sa napiling wika.

**Alisin ang Upload:** I-tap ang "Alisin" para bumalik sa bundled daily text.`,
    },
    {
      icon: Search,
      title: 'Paghahanap',
      content: `**Maghanap sa Bibliya:** Gamitin ang Search tab para maghanap ng mga keyword at parirala sa lahat ng 66 na aklat.

**Mga Resulta:** Makikita ang aklat, kabanata, at tumutugmang teksto. I-tap ang anumang resulta para diretso pumunta sa kabanata.`,
    },
    {
      icon: Bell,
      title: 'Mga Notipikasyon',
      content: `**Daily Reminders:** I-enable ang reading reminders sa Settings → Notifications.

**Itakda ang Oras:** Pumili ng gustong oras ng paalala (hal. 7:00 AM).

**Suporta ng Browser:** Kailangan ng browser permission ang mga notipikasyon. Kung naka-block, i-enable sa browser settings.`,
    },
    {
      icon: Wifi,
      title: 'Offline Support',
      content: `**Ganap na Offline:** Gumagana ang app kahit walang internet. Lahat ng teksto ng Bibliya ay naka-bundle sa app.

**Lokal na Storage:** Ang reading progress, bookmark, highlight, journal entry, at na-upload na file ay naka-store sa iyong device.

**Walang Account na Kailangan:** Hindi kailangan ng sign-up o login. Lahat ay pribado sa iyong device.`,
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

      <div className="px-4 pt-4">
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

/**
 * Simple markdown-lite renderer for bold text.
 */
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
