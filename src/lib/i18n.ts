// Centralized UI strings for Tagalog (tg) and English (en)

type Strings = Record<string, Record<string, string>>;

const strings: Strings = {
  // App-wide
  'app.title': { tg: 'NWT Reading Planner', en: 'NWT Reading Planner' },

  // Home page
  'home.subtitle': { tg: 'Bagong Sanlibutang\nSalin', en: 'New World\nTranslation' },
  'home.tagline': { tg: 'Subaybayan ang iyong pagbabasa ng Bibliya', en: 'Track your Bible reading progress' },
  'home.overallProgress': { tg: 'Kabuuang Progreso', en: 'Overall Progress' },
  'home.chaptersOf': { tg: 'ng', en: 'of' },
  'home.chaptersRead': { tg: 'na kabanata ang nabasa', en: 'chapters read' },
  'home.todaysReading': { tg: 'Pagbabasa Ngayon', en: "Today's Reading" },
  'home.continueReading': { tg: 'Ipagpatuloy ang Pagbabasa', en: 'Continue Reading' },
  'home.openBible': { tg: 'Buksan ang Bibliya', en: 'Open Bible' },
  'home.search': { tg: 'Maghanap', en: 'Search' },
  'home.bookmarks': { tg: 'Mga Bookmark', en: 'Bookmarks' },
  'home.journal': { tg: 'Talaarawan', en: 'Journal' },
  'home.viewProgress': { tg: 'Tingnan ang Progreso', en: 'View Progress' },

  // Daily text
  'dailyText.title': { tg: 'Teksto sa Araw na Ito', en: 'Daily Text' },
  'dailyText.readMore': { tg: 'Magbasa pa', en: 'Read more' },
  'dailyText.showLess': { tg: 'Mas kaunti', en: 'Show less' },

  // Reader
  'reader.title': { tg: 'Bibliya', en: 'Bible' },
  'reader.subtitle': { tg: 'Pumili ng aklat upang basahin', en: 'Select a book to read' },
  'reader.hebrewScriptures': { tg: 'Hebreong Kasulatan', en: 'Hebrew Scriptures' },
  'reader.greekScriptures': { tg: 'Kristiyanong Griegong Kasulatan', en: 'Greek Scriptures' },
  'reader.chapters': { tg: 'kabanata', en: 'chapters' },
  'reader.reference': { tg: 'Sanggunian', en: 'Reference' },
  'reader.markRead': { tg: 'Markahan bilang Nabasa', en: 'Mark Read' },
  'reader.read': { tg: 'Nabasa', en: 'Read' },
  'reader.previous': { tg: 'Nakaraan', en: 'Previous' },
  'reader.next': { tg: 'Susunod', en: 'Next' },
  'reader.verseTip': { tg: 'I-tap ang numero ng talata upang i-bookmark · I-tap ang * upang makita ang footnote · Mag-swipe upang mag-navigate', en: 'Tap a verse number to bookmark · Tap * to view footnote · Swipe to navigate' },
  'reader.couldNotLoad': { tg: 'Hindi ma-load ang nilalaman ng kabanata mula sa EPUB.', en: 'Could not load chapter content from EPUB.' },

  // Search
  'search.title': { tg: 'Maghanap', en: 'Search' },
  'search.subtitle': { tg: 'Maghanap ng mga talata at keyword', en: 'Find verses and keywords' },
  'search.placeholder': { tg: 'Maghanap sa Bibliya...', en: 'Search the Bible...' },
  'search.button': { tg: 'Maghanap', en: 'Search' },
  'search.searching': { tg: 'Naghahanap…', en: 'Searching…' },
  'search.noResults': { tg: 'Walang resulta para sa', en: 'No results found for' },
  'search.results': { tg: 'resulta ang nahanap', en: 'result(s) found' },

  // Bookmarks
  'bookmarks.title': { tg: 'Mga Bookmark', en: 'Bookmarks' },
  'bookmarks.saved': { tg: 'nai-save', en: 'saved' },
  'bookmarks.empty': { tg: 'Wala pang bookmark', en: 'No bookmarks yet' },
  'bookmarks.emptyHint': { tg: 'I-tap ang icon ng bookmark habang nagbabasa upang mag-save ng mga talata', en: 'Tap the bookmark icon while reading to save verses' },
  'bookmarks.saveBookmark': { tg: 'I-save ang Bookmark', en: 'Save Bookmark' },
  'bookmarks.highlightColor': { tg: 'Kulay ng Highlight', en: 'Highlight Color' },
  'bookmarks.addNote': { tg: 'Magdagdag ng tala (opsyonal)...', en: 'Add a note (optional)...' },
  'bookmarks.cancel': { tg: 'Kanselahin', en: 'Cancel' },

  // Journal
  'journal.title': { tg: 'Talaarawan', en: 'Journal' },
  'journal.subtitle': { tg: 'Mga personal na pagninilay', en: 'Personal reflections' },
  'journal.newEntry': { tg: 'Bagong Entry', en: 'New Entry' },
  'journal.empty': { tg: 'Wala pang journal entry', en: 'No journal entries yet' },
  'journal.emptyHint': { tg: 'Magsulat ng mga pagninilay tungkol sa iyong pagbabasa ng Bibliya. Itali sa mga tiyak na kabanata o talata.', en: 'Start writing reflections about your Bible reading. Tie them to specific chapters or verses.' },
  'journal.writeFirst': { tg: 'Isulat ang Unang Entry', en: 'Write First Entry' },
  'journal.edit': { tg: 'I-edit', en: 'Edit' },
  'journal.delete': { tg: 'Burahin', en: 'Delete' },
  'journal.deleteConfirm': { tg: 'Burahin ang entry na ito?', en: 'Delete this entry?' },
  'journal.deleteDesc': { tg: 'Hindi ito maaaring i-undo.', en: 'This cannot be undone.' },
  'journal.mood': { tg: 'Damdamin', en: 'Mood' },
  'journal.editEntry': { tg: 'I-edit ang Entry', en: 'Edit Entry' },
  'journal.newJournalEntry': { tg: 'Bagong Journal Entry', en: 'New Journal Entry' },
  'journal.writeReflection': { tg: 'Isulat ang iyong personal na pagninilay', en: 'Write your personal reflection' },
  'journal.scriptureRef': { tg: 'Sangguniang Kasulatan', en: 'Scripture Reference' },
  'journal.entryTitle': { tg: 'Pamagat ng entry...', en: 'Entry title...' },
  'journal.moodOptional': { tg: 'Damdamin (opsyonal)', en: 'Mood (optional)' },
  'journal.writePlaceholder': { tg: 'Isulat ang iyong pagninilay...', en: 'Write your reflection...' },
  'journal.save': { tg: 'I-save ang Entry', en: 'Save Entry' },
  'journal.update': { tg: 'I-update', en: 'Update' },

  // Progress
  'progress.title': { tg: 'Progreso', en: 'Progress' },
  'progress.subtitle': { tg: 'Ang iyong paglalakbay sa pagbabasa', en: 'Your reading journey' },
  'progress.overall': { tg: 'Kabuuang Progreso', en: 'Overall Progress' },
  'progress.thisWeek': { tg: 'Linggo na Ito', en: 'This Week' },
  'progress.weeklyActivity': { tg: 'Lingguhang Pagbabasa', en: 'Weekly Reading Activity' },
  'progress.byBook': { tg: 'Ayon sa Aklat', en: 'By Book' },
  'progress.startReading': { tg: 'Magsimulang magbasa upang makita ang iyong progreso dito!', en: 'Start reading to see your progress here!' },
  'progress.startWeekly': { tg: 'Magsimulang magbasa upang makita ang iyong lingguhang aktibidad', en: 'Start reading to see your weekly activity' },

  // Statistics
  'stats.title': { tg: 'Istatistika', en: 'Statistics' },
  'stats.chaptersCompleted': { tg: 'Kabanata ang Natapos', en: 'Chapters Completed' },
  'stats.avgDailyTime': { tg: 'Ave. Oras Bawat Araw', en: 'Avg. Daily Reading' },
  'stats.planAdherence': { tg: 'Pagsunod sa Plano', en: 'Plan Adherence' },
  'stats.minutes': { tg: 'min', en: 'min' },

  // Plans
  'plans.title': { tg: 'Mga Plano sa Pagbabasa', en: 'Reading Plans' },
  'plans.subtitle': { tg: 'Piliin kung paano basahin ang Bibliya', en: 'Choose how to read the Bible' },
  'plans.readingSpeed': { tg: 'Bilis ng Pagbabasa', en: 'Reading Speed' },
  'plans.targetDate': { tg: 'Target na Petsa ng Pagtatapos', en: 'Target Completion Date' },
  'plans.chaptersRemaining': { tg: 'natitirang kabanata', en: 'chapters remaining' },
  'plans.chaptersPerDay': { tg: 'kabanata/araw', en: 'chapters/day' },

  // Settings
  'settings.title': { tg: 'Mga Setting', en: 'Settings' },
  'settings.subtitle': { tg: 'I-customize ang iyong karanasan', en: 'Customize your experience' },
  'settings.appearance': { tg: 'Hitsura', en: 'Appearance' },
  'settings.darkMode': { tg: 'Dark Mode', en: 'Dark Mode' },
  'settings.fontSize': { tg: 'Laki ng Font', en: 'Font Size' },
  'settings.language': { tg: 'Wika', en: 'Language' },
  'settings.bibleLanguage': { tg: 'Wika ng Bibliya', en: 'Bible Language' },
  'settings.dailyText': { tg: 'Teksto sa Araw na Ito', en: 'Daily Text' },
  'settings.dailyTextFile': { tg: 'File ng Daily Text', en: 'Daily Text File' },
  'settings.entriesLoaded': { tg: 'entry ang na-load', en: 'entries loaded' },
  'settings.usingBundled': { tg: 'Gamit ang bundled daily text', en: 'Using bundled daily text' },
  'settings.uploadEpub': { tg: 'Mag-upload ng EPUB', en: 'Upload EPUB' },
  'settings.uploading': { tg: 'Nag-a-upload...', en: 'Uploading...' },
  'settings.remove': { tg: 'Alisin', en: 'Remove' },
  'settings.notifications': { tg: 'Mga Notipikasyon', en: 'Notifications' },
  'settings.dailyReminder': { tg: 'Daily Reading Reminder', en: 'Daily Reading Reminder' },
  'settings.notSupported': { tg: 'Hindi suportado sa browser na ito', en: 'Not supported in this browser' },
  'settings.blocked': { tg: 'Naka-block ang mga notipikasyon. I-enable sa browser settings.', en: 'Notifications blocked. Enable in browser settings.' },
  'settings.reminderTime': { tg: 'Oras ng Paalala', en: 'Reminder Time' },
  'settings.data': { tg: 'Data', en: 'Data' },
  'settings.resetProgress': { tg: 'I-reset ang Progreso', en: 'Reset Progress' },
  'settings.resetDesc': { tg: 'I-clear ang lahat ng progress at time data sa pagbabasa', en: 'Clear all reading progress and time data' },
  'settings.resetConfirm': { tg: 'I-reset ang lahat ng progreso?', en: 'Reset all progress?' },
  'settings.resetConfirmDesc': { tg: 'Permanenteng maaalis ang lahat ng iyong reading progress, chapter marks, at reading time data. Ang plan selection, language preference, daily text, at appearance settings ay mananatili.', en: 'This will permanently clear all your reading progress, chapter marks, and reading time data. Your plan selection, language preference, daily text, and appearance settings will be preserved.' },
  'settings.about': { tg: 'Tungkol sa', en: 'About' },
  'settings.aboutDesc': { tg: 'Isang plano sa pagbabasa ng Bibliya para sa New World Translation. Ang lahat ng data ay naka-store nang lokal sa iyong device.', en: 'A Bible reading planner for the New World Translation. All data is stored locally on your device.' },

  // Footnotes
  'footnotes.title': { tg: 'Mga Footnote at Cross-Reference', en: 'Footnotes & Cross-References' },

  // Bottom nav
  'nav.home': { tg: 'Home', en: 'Home' },
  'nav.bible': { tg: 'Bibliya', en: 'Bible' },
  'nav.search': { tg: 'Hanap', en: 'Search' },
  'nav.journal': { tg: 'Talaarawan', en: 'Journal' },
  'nav.settings': { tg: 'Settings', en: 'Settings' },

  // How-to
  'howto.title': { tg: 'Paano Gamitin', en: 'How to Use' },
  'howto.subtitle': { tg: 'Gabay sa lahat ng feature ng app', en: 'Guide to all app features' },
  'settings.howTo': { tg: 'Paano Gamitin', en: 'How to Use' },
  'settings.howToDesc': { tg: 'Mga gabay sa lahat ng feature', en: 'Guide to all app features' },

  // Highlights
  'highlights.pickColor': { tg: 'Pumili ng kulay ng highlight', en: 'Pick highlight color' },

  // Common
  'common.cancel': { tg: 'Kanselahin', en: 'Cancel' },
  'common.save': { tg: 'I-save', en: 'Save' },
  'common.delete': { tg: 'Burahin', en: 'Delete' },
};

/**
 * Get a localized UI string by key and language.
 * Falls back to English, then the key itself.
 */
export function t(key: string, lang: string): string {
  const entry = strings[key];
  if (!entry) return key;
  return entry[lang] || entry['en'] || key;
}
