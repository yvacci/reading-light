// Bible book structure for NWT
export interface BibleBook {
  id: number;
  name: string;
  shortName: string;
  chapters: number;
  testament: 'OT' | 'NT';
}

// Tagalog NWT book names
export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { id: 1, name: 'Genesis', shortName: 'Gen', chapters: 50, testament: 'OT' },
  { id: 2, name: 'Exodo', shortName: 'Exo', chapters: 40, testament: 'OT' },
  { id: 3, name: 'Levitico', shortName: 'Lev', chapters: 27, testament: 'OT' },
  { id: 4, name: 'Mga Bilang', shortName: 'Bil', chapters: 36, testament: 'OT' },
  { id: 5, name: 'Deuteronomio', shortName: 'Deu', chapters: 34, testament: 'OT' },
  { id: 6, name: 'Josue', shortName: 'Jos', chapters: 24, testament: 'OT' },
  { id: 7, name: 'Mga Hukom', shortName: 'Huk', chapters: 21, testament: 'OT' },
  { id: 8, name: 'Ruth', shortName: 'Rut', chapters: 4, testament: 'OT' },
  { id: 9, name: '1 Samuel', shortName: '1Sa', chapters: 31, testament: 'OT' },
  { id: 10, name: '2 Samuel', shortName: '2Sa', chapters: 24, testament: 'OT' },
  { id: 11, name: '1 Hari', shortName: '1Ha', chapters: 22, testament: 'OT' },
  { id: 12, name: '2 Hari', shortName: '2Ha', chapters: 25, testament: 'OT' },
  { id: 13, name: '1 Cronica', shortName: '1Cr', chapters: 29, testament: 'OT' },
  { id: 14, name: '2 Cronica', shortName: '2Cr', chapters: 36, testament: 'OT' },
  { id: 15, name: 'Ezra', shortName: 'Ezr', chapters: 10, testament: 'OT' },
  { id: 16, name: 'Nehemias', shortName: 'Neh', chapters: 13, testament: 'OT' },
  { id: 17, name: 'Esther', shortName: 'Est', chapters: 10, testament: 'OT' },
  { id: 18, name: 'Job', shortName: 'Job', chapters: 42, testament: 'OT' },
  { id: 19, name: 'Mga Awit', shortName: 'Aw', chapters: 150, testament: 'OT' },
  { id: 20, name: 'Mga Kawikaan', shortName: 'Kaw', chapters: 31, testament: 'OT' },
  { id: 21, name: 'Eclesiastes', shortName: 'Ecl', chapters: 12, testament: 'OT' },
  { id: 22, name: 'Awit ni Solomon', shortName: 'Sol', chapters: 8, testament: 'OT' },
  { id: 23, name: 'Isaias', shortName: 'Isa', chapters: 66, testament: 'OT' },
  { id: 24, name: 'Jeremias', shortName: 'Jer', chapters: 52, testament: 'OT' },
  { id: 25, name: 'Mga Panaghoy', shortName: 'Pan', chapters: 5, testament: 'OT' },
  { id: 26, name: 'Ezekiel', shortName: 'Eze', chapters: 48, testament: 'OT' },
  { id: 27, name: 'Daniel', shortName: 'Dan', chapters: 12, testament: 'OT' },
  { id: 28, name: 'Hosea', shortName: 'Hos', chapters: 14, testament: 'OT' },
  { id: 29, name: 'Joel', shortName: 'Joe', chapters: 3, testament: 'OT' },
  { id: 30, name: 'Amos', shortName: 'Amo', chapters: 9, testament: 'OT' },
  { id: 31, name: 'Obadias', shortName: 'Oba', chapters: 1, testament: 'OT' },
  { id: 32, name: 'Jonas', shortName: 'Jon', chapters: 4, testament: 'OT' },
  { id: 33, name: 'Mikas', shortName: 'Mik', chapters: 7, testament: 'OT' },
  { id: 34, name: 'Nahum', shortName: 'Nah', chapters: 3, testament: 'OT' },
  { id: 35, name: 'Habakuk', shortName: 'Hab', chapters: 3, testament: 'OT' },
  { id: 36, name: 'Zefanias', shortName: 'Zef', chapters: 3, testament: 'OT' },
  { id: 37, name: 'Hagai', shortName: 'Hag', chapters: 2, testament: 'OT' },
  { id: 38, name: 'Zacarias', shortName: 'Zac', chapters: 14, testament: 'OT' },
  { id: 39, name: 'Malakias', shortName: 'Mal', chapters: 4, testament: 'OT' },
  // New Testament
  { id: 40, name: 'Mateo', shortName: 'Mat', chapters: 28, testament: 'NT' },
  { id: 41, name: 'Marcos', shortName: 'Mar', chapters: 16, testament: 'NT' },
  { id: 42, name: 'Lucas', shortName: 'Luc', chapters: 24, testament: 'NT' },
  { id: 43, name: 'Juan', shortName: 'Jua', chapters: 21, testament: 'NT' },
  { id: 44, name: 'Mga Gawa', shortName: 'Gaw', chapters: 28, testament: 'NT' },
  { id: 45, name: 'Roma', shortName: 'Rom', chapters: 16, testament: 'NT' },
  { id: 46, name: '1 Corinto', shortName: '1Co', chapters: 16, testament: 'NT' },
  { id: 47, name: '2 Corinto', shortName: '2Co', chapters: 13, testament: 'NT' },
  { id: 48, name: 'Galacia', shortName: 'Gal', chapters: 6, testament: 'NT' },
  { id: 49, name: 'Efeso', shortName: 'Efe', chapters: 6, testament: 'NT' },
  { id: 50, name: 'Filipos', shortName: 'Fil', chapters: 4, testament: 'NT' },
  { id: 51, name: 'Colosas', shortName: 'Col', chapters: 4, testament: 'NT' },
  { id: 52, name: '1 Tesalonica', shortName: '1Te', chapters: 5, testament: 'NT' },
  { id: 53, name: '2 Tesalonica', shortName: '2Te', chapters: 3, testament: 'NT' },
  { id: 54, name: '1 Timoteo', shortName: '1Ti', chapters: 6, testament: 'NT' },
  { id: 55, name: '2 Timoteo', shortName: '2Ti', chapters: 4, testament: 'NT' },
  { id: 56, name: 'Tito', shortName: 'Tit', chapters: 3, testament: 'NT' },
  { id: 57, name: 'Filemon', shortName: 'Flm', chapters: 1, testament: 'NT' },
  { id: 58, name: 'Hebreo', shortName: 'Heb', chapters: 13, testament: 'NT' },
  { id: 59, name: 'Santiago', shortName: 'San', chapters: 5, testament: 'NT' },
  { id: 60, name: '1 Pedro', shortName: '1Pe', chapters: 5, testament: 'NT' },
  { id: 61, name: '2 Pedro', shortName: '2Pe', chapters: 3, testament: 'NT' },
  { id: 62, name: '1 Juan', shortName: '1Ju', chapters: 5, testament: 'NT' },
  { id: 63, name: '2 Juan', shortName: '2Ju', chapters: 1, testament: 'NT' },
  { id: 64, name: '3 Juan', shortName: '3Ju', chapters: 1, testament: 'NT' },
  { id: 65, name: 'Judas', shortName: 'Jud', chapters: 1, testament: 'NT' },
  { id: 66, name: 'Apocalipsis', shortName: 'Apo', chapters: 22, testament: 'NT' },
];

export const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, book) => sum + book.chapters, 0);

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'canonical',
    name: 'Canonical Order',
    description: 'Read the Bible in its standard sequence from Genesis to Revelation.',
    icon: '📖',
  },
  {
    id: 'chronological',
    name: 'Chronological Order',
    description: 'Follow events in the approximate historical timeline.',
    icon: '📅',
  },
  {
    id: 'writing-order',
    name: 'By Writing Order',
    description: 'Read in the approximate order the books were composed.',
    icon: '✍️',
  },
  {
    id: 'nt-first',
    name: 'New Testament First',
    description: 'Start with the Christian Greek Scriptures before the Hebrew Scriptures.',
    icon: '✝️',
  },
];

// Generate canonical reading order
export function getCanonicalOrder(): { bookId: number; chapter: number }[] {
  const order: { bookId: number; chapter: number }[] = [];
  for (const book of BIBLE_BOOKS) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      order.push({ bookId: book.id, chapter: ch });
    }
  }
  return order;
}

export function getBookById(id: number): BibleBook | undefined {
  return BIBLE_BOOKS.find(b => b.id === id);
}
