// Centralized UI strings — Tagalog only

type Strings = Record<string, string>;

const strings: Strings = {
  // App-wide
  'app.title': 'NWT Reading Planner',

  // Home page
  'home.subtitle': 'Bagong Sanlibutang\nSalin',
  'home.tagline': 'Subaybayan ang iyong pagbabasa ng Bibliya',
  'home.overallProgress': 'Kabuuang Progreso',
  'home.chaptersOf': 'ng',
  'home.chaptersRead': 'na kabanata ang nabasa',
  'home.todaysReading': 'Pagbabasa Ngayon',
  'home.continueReading': 'Ipagpatuloy ang Pagbabasa',
  'home.openBible': 'Buksan ang Bibliya',
  'home.search': 'Maghanap',
  'home.bookmarks': 'Mga Bookmark',
  'home.journal': 'Talaarawan',
  'home.viewProgress': 'Tingnan ang Progreso',

  // Daily text
  'dailyText.title': 'Teksto sa Araw na Ito',
  'dailyText.readMore': 'Magbasa pa',
  'dailyText.showLess': 'Mas kaunti',
  'dailyText.pageSubtitle': 'Pagsusuri ng Kasulatan Araw-araw',
  'dailyText.goToToday': 'Pumunta sa ngayon',
  'dailyText.noEntry': 'Walang teksto para sa araw na ito',

  // Reader
  'reader.title': 'Bibliya',
  'reader.subtitle': 'Pumili ng aklat upang basahin',
  'reader.hebrewScriptures': 'Hebreong Kasulatan',
  'reader.greekScriptures': 'Kristiyanong Griegong Kasulatan',
  'reader.chapters': 'kabanata',
  'reader.reference': 'Sanggunian',
  'reader.markRead': 'Markahan bilang Nabasa',
  'reader.read': 'Nabasa',
  'reader.previous': 'Nakaraan',
  'reader.next': 'Susunod',
  'reader.verseTip': 'I-tap ang numero ng talata upang i-bookmark · I-tap ang * upang makita ang footnote · Mag-swipe upang mag-navigate',
  'reader.couldNotLoad': 'Hindi ma-load ang nilalaman ng kabanata mula sa EPUB.',

  // Search
  'search.title': 'Maghanap',
  'search.subtitle': 'Maghanap ng mga talata at keyword',
  'search.placeholder': 'Maghanap sa Bibliya...',
  'search.button': 'Maghanap',
  'search.searching': 'Naghahanap…',
  'search.noResults': 'Walang resulta para sa',
  'search.results': 'resulta ang nahanap',

  // Bookmarks
  'bookmarks.title': 'Mga Bookmark',
  'bookmarks.saved': 'nai-save',
  'bookmarks.empty': 'Wala pang bookmark',
  'bookmarks.emptyHint': 'I-tap ang icon ng bookmark habang nagbabasa upang mag-save ng mga talata',
  'bookmarks.saveBookmark': 'I-save ang Bookmark',
  'bookmarks.highlightColor': 'Kulay ng Highlight',
  'bookmarks.addNote': 'Magdagdag ng tala (opsyonal)...',
  'bookmarks.cancel': 'Kanselahin',

  // Journal
  'journal.title': 'Talaarawan',
  'journal.subtitle': 'Mga personal na pagninilay',
  'journal.newEntry': 'Bagong Entry',
  'journal.empty': 'Wala pang journal entry',
  'journal.emptyHint': 'Magsulat ng mga pagninilay tungkol sa iyong pagbabasa ng Bibliya. Itali sa mga tiyak na kabanata o talata.',
  'journal.writeFirst': 'Isulat ang Unang Entry',
  'journal.edit': 'I-edit',
  'journal.delete': 'Burahin',
  'journal.deleteConfirm': 'Burahin ang entry na ito?',
  'journal.deleteDesc': 'Hindi ito maaaring i-undo.',
  'journal.mood': 'Damdamin',
  'journal.editEntry': 'I-edit ang Entry',
  'journal.newJournalEntry': 'Bagong Journal Entry',
  'journal.writeReflection': 'Isulat ang iyong personal na pagninilay',
  'journal.scriptureRef': 'Sangguniang Kasulatan',
  'journal.entryTitle': 'Pamagat ng entry...',
  'journal.moodOptional': 'Damdamin (opsyonal)',
  'journal.writePlaceholder': 'Isulat ang iyong pagninilay...',
  'journal.save': 'I-save ang Entry',
  'journal.update': 'I-update',

  // Progress
  'progress.title': 'Progreso',
  'progress.subtitle': 'Ang iyong paglalakbay sa pagbabasa',
  'progress.overall': 'Kabuuang Progreso',
  'progress.thisWeek': 'Linggo na Ito',
  'progress.weeklyActivity': 'Lingguhang Pagbabasa',
  'progress.byBook': 'Ayon sa Aklat',
  'progress.startReading': 'Magsimulang magbasa upang makita ang iyong progreso dito!',
  'progress.startWeekly': 'Magsimulang magbasa upang makita ang iyong lingguhang aktibidad',

  // Statistics
  'stats.title': 'Istatistika',
  'stats.chaptersCompleted': 'Kabanata ang Natapos',
  'stats.avgDailyTime': 'Ave. Oras Bawat Araw',
  'stats.planAdherence': 'Pagsunod sa Plano',
  'stats.minutes': 'min',

  // Plans
  'plans.title': 'Mga Plano sa Pagbabasa',
  'plans.subtitle': 'Piliin kung paano basahin ang Bibliya',
  'plans.readingSpeed': 'Bilis ng Pagbabasa',
  'plans.targetDate': 'Target na Petsa ng Pagtatapos',
  'plans.chaptersRemaining': 'natitirang kabanata',
  'plans.chaptersPerDay': 'kabanata/araw',

  // Settings
  'settings.title': 'Mga Setting',
  'settings.subtitle': 'I-customize ang iyong karanasan',
  'settings.appearance': 'Hitsura',
  'settings.darkMode': 'Dark Mode',
  'settings.fontSize': 'Laki ng Font',
  'settings.dailyText': 'Teksto sa Araw na Ito',
  'settings.dailyTextFile': 'File ng Daily Text',
  'settings.entriesLoaded': 'entry ang na-load',
  'settings.usingBundled': 'Gamit ang bundled daily text',
  'settings.uploadEpub': 'Mag-upload ng PDF',
  'settings.uploading': 'Nag-a-upload...',
  'settings.remove': 'Alisin',
  'settings.notifications': 'Mga Notipikasyon',
  'settings.dailyReminder': 'Daily Reading Reminder',
  'settings.notSupported': 'Hindi suportado sa browser na ito',
  'settings.blocked': 'Naka-block ang mga notipikasyon. I-enable sa browser settings.',
  'settings.reminderTime': 'Oras ng Paalala',
  'settings.data': 'Data',
  'settings.resetProgress': 'I-reset ang Progreso',
  'settings.resetDesc': 'I-clear ang lahat ng progress at time data sa pagbabasa',
  'settings.resetConfirm': 'I-reset ang lahat ng progreso?',
  'settings.resetConfirmDesc': 'Permanenteng maaalis ang lahat ng iyong reading progress, chapter marks, at reading time data. Ang plan selection, daily text, at appearance settings ay mananatili.',
  'settings.about': 'Tungkol sa',
  'settings.aboutDesc': 'Isang plano sa pagbabasa ng Bibliya para sa New World Translation. Ang lahat ng data ay naka-store nang lokal sa iyong device.',
  'settings.backup': 'Backup',
  'settings.backupRestore': 'Backup at Restore',
  'settings.backupDesc': 'I-export o i-import ang lahat ng data ng app',
  'settings.export': 'I-export',
  'settings.import': 'I-import',

  // Footnotes
  'footnotes.title': 'Mga Footnote at Cross-Reference',

  // Bottom nav
  'nav.home': 'Home',
  'nav.bible': 'Bibliya',
  'nav.dailyText': 'Teksto',
  'nav.search': 'Hanap',
  'nav.journal': 'Talaarawan',
  'nav.settings': 'Settings',
  'nav.pioneer': 'Pioneer',
  'nav.studies': 'Pag-aaral',

  // How-to
  'howto.title': 'Paano Gamitin',
  'howto.subtitle': 'Gabay sa lahat ng feature ng app',
  'settings.howTo': 'Paano Gamitin',
  'settings.howToDesc': 'Mga gabay sa lahat ng feature',

  // Highlights
  'highlights.pickColor': 'Pumili ng kulay ng highlight',
  'highlights.changeColor': 'Palitan ang kulay',
  'highlights.delete': 'Alisin ang highlight',

  // Pioneer
  'pioneer.title': 'Regular Pioneer',
  'pioneer.subtitle': 'Subaybayan ang iyong ministeryo',
  'pioneer.monthlySummary': 'Buod ng Buwan',
  'pioneer.totalHours': 'Kabuuang Oras',
  'pioneer.bibleStudies': 'Bible Study',
  'pioneer.returnVisits': 'Return Visit',
  'pioneer.witnessing': 'Public Witnessing',
  'pioneer.daysLogged': 'araw na naitala',
  'pioneer.ministryHours': 'Oras ng Ministeryo',
  'pioneer.witnessingHours': 'Oras ng Public Witnessing',
  'pioneer.serviceYear': 'Target ng Taon ng Serbisyo',
  'pioneer.serviceYearHours': 'Oras sa Taon ng Serbisyo',
  'pioneer.expectedPace': 'Inaasahang bilis',

  // Studies & Visits
  'studies.title': 'Pag-aaral at Pagdalaw',
  'studies.subtitle': 'Pamahalaan ang iyong Bible study at return visit',
  'studies.bibleStudies': 'Bible Study',
  'studies.returnVisits': 'Return Visit',
  'studies.bibleStudy': 'Bible Study',
  'studies.returnVisit': 'Return Visit',
  'studies.all': 'Lahat',
  'studies.add': 'Dagdag',
  'studies.addNew': 'Bagong Entry',
  'studies.edit': 'I-edit',
  'studies.name': 'Pangalan',
  'studies.contact': 'Contact Info',
  'studies.lastVisit': 'Huling Pagdalaw',
  'studies.notes': 'Mga Tala',
  'studies.searchPlaceholder': 'Maghanap ng pangalan...',
  'studies.empty': 'Wala pang entry',
  'studies.deleteConfirm': 'Hindi ito maaaring i-undo.',

  // Common
  'common.cancel': 'Kanselahin',
  'common.save': 'I-save',
  'common.delete': 'Burahin',
};

/**
 * Get a localized UI string by key.
 * The lang parameter is kept for API compatibility but ignored (Tagalog only).
 */
export function t(key: string, _lang?: string): string {
  return strings[key] || key;
}
