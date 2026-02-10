// Bible book structure for NWT
export interface BibleBook {
  id: number;
  name: string;
  shortName: string;
  chapters: number;
  testament: 'OT' | 'NT';
  wolBookNum: number;
}

// Tagalog NWT book names
export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { id: 1, name: 'Genesis', shortName: 'Gen', chapters: 50, testament: 'OT', wolBookNum: 1 },
  { id: 2, name: 'Exodo', shortName: 'Exo', chapters: 40, testament: 'OT', wolBookNum: 2 },
  { id: 3, name: 'Levitico', shortName: 'Lev', chapters: 27, testament: 'OT', wolBookNum: 3 },
  { id: 4, name: 'Mga Bilang', shortName: 'Bil', chapters: 36, testament: 'OT', wolBookNum: 4 },
  { id: 5, name: 'Deuteronomio', shortName: 'Deu', chapters: 34, testament: 'OT', wolBookNum: 5 },
  { id: 6, name: 'Josue', shortName: 'Jos', chapters: 24, testament: 'OT', wolBookNum: 6 },
  { id: 7, name: 'Mga Hukom', shortName: 'Huk', chapters: 21, testament: 'OT', wolBookNum: 7 },
  { id: 8, name: 'Ruth', shortName: 'Rut', chapters: 4, testament: 'OT', wolBookNum: 8 },
  { id: 9, name: '1 Samuel', shortName: '1Sa', chapters: 31, testament: 'OT', wolBookNum: 9 },
  { id: 10, name: '2 Samuel', shortName: '2Sa', chapters: 24, testament: 'OT', wolBookNum: 10 },
  { id: 11, name: '1 Hari', shortName: '1Ha', chapters: 22, testament: 'OT', wolBookNum: 11 },
  { id: 12, name: '2 Hari', shortName: '2Ha', chapters: 25, testament: 'OT', wolBookNum: 12 },
  { id: 13, name: '1 Cronica', shortName: '1Cr', chapters: 29, testament: 'OT', wolBookNum: 13 },
  { id: 14, name: '2 Cronica', shortName: '2Cr', chapters: 36, testament: 'OT', wolBookNum: 14 },
  { id: 15, name: 'Ezra', shortName: 'Ezr', chapters: 10, testament: 'OT', wolBookNum: 15 },
  { id: 16, name: 'Nehemias', shortName: 'Neh', chapters: 13, testament: 'OT', wolBookNum: 16 },
  { id: 17, name: 'Esther', shortName: 'Est', chapters: 10, testament: 'OT', wolBookNum: 17 },
  { id: 18, name: 'Job', shortName: 'Job', chapters: 42, testament: 'OT', wolBookNum: 18 },
  { id: 19, name: 'Mga Awit', shortName: 'Aw', chapters: 150, testament: 'OT', wolBookNum: 19 },
  { id: 20, name: 'Mga Kawikaan', shortName: 'Kaw', chapters: 31, testament: 'OT', wolBookNum: 20 },
  { id: 21, name: 'Eclesiastes', shortName: 'Ecl', chapters: 12, testament: 'OT', wolBookNum: 21 },
  { id: 22, name: 'Awit ni Solomon', shortName: 'Sol', chapters: 8, testament: 'OT', wolBookNum: 22 },
  { id: 23, name: 'Isaias', shortName: 'Isa', chapters: 66, testament: 'OT', wolBookNum: 23 },
  { id: 24, name: 'Jeremias', shortName: 'Jer', chapters: 52, testament: 'OT', wolBookNum: 24 },
  { id: 25, name: 'Mga Panaghoy', shortName: 'Pan', chapters: 5, testament: 'OT', wolBookNum: 25 },
  { id: 26, name: 'Ezekiel', shortName: 'Eze', chapters: 48, testament: 'OT', wolBookNum: 26 },
  { id: 27, name: 'Daniel', shortName: 'Dan', chapters: 12, testament: 'OT', wolBookNum: 27 },
  { id: 28, name: 'Hosea', shortName: 'Hos', chapters: 14, testament: 'OT', wolBookNum: 28 },
  { id: 29, name: 'Joel', shortName: 'Joe', chapters: 3, testament: 'OT', wolBookNum: 29 },
  { id: 30, name: 'Amos', shortName: 'Amo', chapters: 9, testament: 'OT', wolBookNum: 30 },
  { id: 31, name: 'Obadias', shortName: 'Oba', chapters: 1, testament: 'OT', wolBookNum: 31 },
  { id: 32, name: 'Jonas', shortName: 'Jon', chapters: 4, testament: 'OT', wolBookNum: 32 },
  { id: 33, name: 'Mikas', shortName: 'Mik', chapters: 7, testament: 'OT', wolBookNum: 33 },
  { id: 34, name: 'Nahum', shortName: 'Nah', chapters: 3, testament: 'OT', wolBookNum: 34 },
  { id: 35, name: 'Habakuk', shortName: 'Hab', chapters: 3, testament: 'OT', wolBookNum: 35 },
  { id: 36, name: 'Zefanias', shortName: 'Zef', chapters: 3, testament: 'OT', wolBookNum: 36 },
  { id: 37, name: 'Hagai', shortName: 'Hag', chapters: 2, testament: 'OT', wolBookNum: 37 },
  { id: 38, name: 'Zacarias', shortName: 'Zac', chapters: 14, testament: 'OT', wolBookNum: 38 },
  { id: 39, name: 'Malakias', shortName: 'Mal', chapters: 4, testament: 'OT', wolBookNum: 39 },
  // New Testament
  { id: 40, name: 'Mateo', shortName: 'Mat', chapters: 28, testament: 'NT', wolBookNum: 40 },
  { id: 41, name: 'Marcos', shortName: 'Mar', chapters: 16, testament: 'NT', wolBookNum: 41 },
  { id: 42, name: 'Lucas', shortName: 'Luc', chapters: 24, testament: 'NT', wolBookNum: 42 },
  { id: 43, name: 'Juan', shortName: 'Jua', chapters: 21, testament: 'NT', wolBookNum: 43 },
  { id: 44, name: 'Mga Gawa', shortName: 'Gaw', chapters: 28, testament: 'NT', wolBookNum: 44 },
  { id: 45, name: 'Roma', shortName: 'Rom', chapters: 16, testament: 'NT', wolBookNum: 45 },
  { id: 46, name: '1 Corinto', shortName: '1Co', chapters: 16, testament: 'NT', wolBookNum: 46 },
  { id: 47, name: '2 Corinto', shortName: '2Co', chapters: 13, testament: 'NT', wolBookNum: 47 },
  { id: 48, name: 'Galacia', shortName: 'Gal', chapters: 6, testament: 'NT', wolBookNum: 48 },
  { id: 49, name: 'Efeso', shortName: 'Efe', chapters: 6, testament: 'NT', wolBookNum: 49 },
  { id: 50, name: 'Filipos', shortName: 'Fil', chapters: 4, testament: 'NT', wolBookNum: 50 },
  { id: 51, name: 'Colosas', shortName: 'Col', chapters: 4, testament: 'NT', wolBookNum: 51 },
  { id: 52, name: '1 Tesalonica', shortName: '1Te', chapters: 5, testament: 'NT', wolBookNum: 52 },
  { id: 53, name: '2 Tesalonica', shortName: '2Te', chapters: 3, testament: 'NT', wolBookNum: 53 },
  { id: 54, name: '1 Timoteo', shortName: '1Ti', chapters: 6, testament: 'NT', wolBookNum: 54 },
  { id: 55, name: '2 Timoteo', shortName: '2Ti', chapters: 4, testament: 'NT', wolBookNum: 55 },
  { id: 56, name: 'Tito', shortName: 'Tit', chapters: 3, testament: 'NT', wolBookNum: 56 },
  { id: 57, name: 'Filemon', shortName: 'Flm', chapters: 1, testament: 'NT', wolBookNum: 57 },
  { id: 58, name: 'Hebreo', shortName: 'Heb', chapters: 13, testament: 'NT', wolBookNum: 58 },
  { id: 59, name: 'Santiago', shortName: 'San', chapters: 5, testament: 'NT', wolBookNum: 59 },
  { id: 60, name: '1 Pedro', shortName: '1Pe', chapters: 5, testament: 'NT', wolBookNum: 60 },
  { id: 61, name: '2 Pedro', shortName: '2Pe', chapters: 3, testament: 'NT', wolBookNum: 61 },
  { id: 62, name: '1 Juan', shortName: '1Ju', chapters: 5, testament: 'NT', wolBookNum: 62 },
  { id: 63, name: '2 Juan', shortName: '2Ju', chapters: 1, testament: 'NT', wolBookNum: 63 },
  { id: 64, name: '3 Juan', shortName: '3Ju', chapters: 1, testament: 'NT', wolBookNum: 64 },
  { id: 65, name: 'Judas', shortName: 'Jud', chapters: 1, testament: 'NT', wolBookNum: 65 },
  { id: 66, name: 'Apocalipsis', shortName: 'Apo', chapters: 22, testament: 'NT', wolBookNum: 66 },
];

export const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, book) => sum + book.chapters, 0);

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const READING_PLANS: ReadingPlan[] = [
  { id: 'canonical', name: 'Canonical Order', description: 'Basahin ang Bibliya mula Genesis hanggang Apocalipsis.', icon: '📖' },
  { id: 'chronological', name: 'Chronological Order', description: 'Sundin ang mga pangyayari ayon sa timeline.', icon: '📅' },
  { id: 'writing-order', name: 'By Writing Order', description: 'Basahin ayon sa pagkakasulat ng mga aklat.', icon: '✍️' },
  { id: 'nt-first', name: 'New Testament First', description: 'Simulan sa Kristiyanong Griegong Kasulatan.', icon: '✝️' },
];

export interface ReadingSpeed {
  id: string;
  label: string;
  description: string;
  chaptersPerDay: number;
}

export const READING_SPEEDS: ReadingSpeed[] = [
  { id: '1yr', label: '1 yr', description: '3 ch/day', chaptersPerDay: 3 },
  { id: '2yr', label: '2 yr', description: '2 ch/day', chaptersPerDay: 2 },
  { id: '3yr', label: '3 yr', description: '1 ch/day', chaptersPerDay: 1 },
];

export function getCanonicalOrder(): { bookId: number; chapter: number }[] {
  const order: { bookId: number; chapter: number }[] = [];
  for (const book of BIBLE_BOOKS) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      order.push({ bookId: book.id, chapter: ch });
    }
  }
  return order;
}

export function getNtFirstOrder(): { bookId: number; chapter: number }[] {
  const order: { bookId: number; chapter: number }[] = [];
  const ntBooks = BIBLE_BOOKS.filter(b => b.testament === 'NT');
  const otBooks = BIBLE_BOOKS.filter(b => b.testament === 'OT');
  for (const book of [...ntBooks, ...otBooks]) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      order.push({ bookId: book.id, chapter: ch });
    }
  }
  return order;
}

const CHRONOLOGICAL_BOOK_ORDER = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 19, 20, 21, 22, 29, 30, 31, 32, 28,
  23, 33, 34, 35, 36, 24, 25, 13, 14, 26, 27, 37, 38, 39, 15, 16, 17,
  40, 41, 42, 43, 44, 59, 48, 52, 53, 46, 47, 45, 49, 50, 51, 57, 54, 56, 55, 58,
  60, 65, 61, 62, 63, 64, 66,
];

export function getChronologicalOrder(): { bookId: number; chapter: number }[] {
  const order: { bookId: number; chapter: number }[] = [];
  for (const bookId of CHRONOLOGICAL_BOOK_ORDER) {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (book) {
      for (let ch = 1; ch <= book.chapters; ch++) {
        order.push({ bookId: book.id, chapter: ch });
      }
    }
  }
  return order;
}

const WRITING_ORDER_BOOKS = [
  18, 1, 2, 3, 4, 5, 19, 6, 7, 8, 9, 10, 22, 29, 30, 28, 23, 20, 21, 11, 12, 32,
  33, 34, 35, 36, 24, 25, 26, 31, 27, 37, 38, 39, 13, 14, 15, 16, 17,
  40, 41, 42, 43, 44, 48, 52, 53, 46, 47, 45, 59, 49, 50, 51, 57, 54, 55, 56,
  60, 58, 65, 61, 62, 63, 64, 66,
];

export function getWritingOrder(): { bookId: number; chapter: number }[] {
  const order: { bookId: number; chapter: number }[] = [];
  for (const bookId of WRITING_ORDER_BOOKS) {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (book) {
      for (let ch = 1; ch <= book.chapters; ch++) {
        order.push({ bookId: book.id, chapter: ch });
      }
    }
  }
  return order;
}

export function getPlanOrder(planId: string): { bookId: number; chapter: number }[] {
  switch (planId) {
    case 'chronological': return getChronologicalOrder();
    case 'writing-order': return getWritingOrder();
    case 'nt-first': return getNtFirstOrder();
    default: return getCanonicalOrder();
  }
}

export function getBookById(id: number): BibleBook | undefined {
  return BIBLE_BOOKS.find(b => b.id === id);
}

/** Build the WOL reference URL for a given book/chapter — always Tagalog */
export function getWolUrl(bookId: number, chapter: number, _lang?: string): string {
  const book = getBookById(bookId);
  if (!book) return 'https://wol.jw.org';
  return `https://wol.jw.org/tl/wol/b/r27/lp-tg/nwtsty/${book.wolBookNum}/${chapter}`;
}
