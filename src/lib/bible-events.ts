/**
 * Historical events and locations tied to Bible chapters for chronological reading plans.
 * Format: bookId-chapter -> events array
 */

export interface BibleEvent {
  year: string; // e.g. "c. 3896 B.C.E" or "2370 B.C.E"
  event: string;
}

export interface ChapterLocation {
  location: string; // e.g. "Eden 5 F3"
}

export interface ChapterEventData {
  events?: BibleEvent[];
  locations?: ChapterLocation[];
}

// Key: "bookId-chapter" e.g. "1-1" for Genesis 1
const CHAPTER_EVENTS: Record<string, ChapterEventData> = {
  // Genesis 1
  '1-1': {
    events: [
      { year: 'c. 46026 B.C.E', event: '"In the beginning God created the heavens and the earth"' },
    ],
  },
  // Genesis 2
  '1-2': {
    events: [
      { year: '4026 B.C.E', event: 'Creation of Adam' },
    ],
    locations: [{ location: 'Eden 5 F3' }],
  },
  // Genesis 3
  '1-3': {
    events: [
      { year: 'c. 3896 B.C.E', event: 'Rebellion in Eden' },
    ],
    locations: [{ location: 'Eden 5 F3' }],
  },
  // Genesis 4
  '1-4': {
    events: [
      { year: 'c. 3896 B.C.E', event: 'Cain slays Abel' },
      { year: '3896 B.C.E', event: 'Birth of Seth' },
      { year: '3404 B.C.E', event: 'Birth of righteous Enoch' },
      { year: '3339 B.C.E', event: 'Birth of Methuselah' },
      { year: '3152 B.C.E', event: 'Birth of Lamech' },
    ],
  },
  // Genesis 5
  '1-5': {
    events: [
      { year: '3096 B.C.E', event: 'Death of Adam' },
      { year: '3039 B.C.E', event: 'Transference of Enoch; ends his period of prophesying' },
      { year: '2970 B.C.E', event: 'Birth of Noah' },
    ],
    locations: [{ location: 'Eden 5 F3' }],
  },
  // Genesis 6
  '1-6': {
    events: [
      { year: '2490 B.C.E', event: "God's pronouncement as to mankind" },
      { year: '2470 B.C.E', event: 'Birth of Japheth' },
      { year: '2468 B.C.E', event: 'Birth of Shem' },
      { year: '2370 B.C.E', event: 'Death of Methuselah' },
    ],
  },
  // Genesis 7-9
  '1-7': {
    events: [
      { year: '2370 B.C.E', event: 'Floodwaters fall (in autumn)' },
    ],
    locations: [{ location: 'Ararat 5 G2' }],
  },
  '1-8': {
    events: [
      { year: '2369 B.C.E', event: 'Making of the covenant after the Flood' },
    ],
    locations: [{ location: 'Canaan 7; 11 D8' }],
  },
  '1-9': {
    events: [
      { year: '2369 B.C.E', event: 'Rainbow covenant established' },
    ],
  },
  // Genesis 10
  '1-10': {
    locations: [{ location: 'Kittim (Cyprus) 5 E3; 23 C2; 26 B3; 32 D2; 33 G4 — Tarshish (Spain) 2; 27 A3' }],
  },
  // Genesis 11
  '1-11': {
    events: [
      { year: 'c. 2269 B.C.E', event: 'Tower of Babel; confusion of languages' },
      { year: '2018 B.C.E', event: 'Birth of Abraham' },
    ],
    locations: [{ location: 'Babel (Babylon) 7 G4; 11 E3' }],
  },
  // Genesis 12
  '1-12': {
    events: [
      { year: '1943 B.C.E', event: "Abrahamic covenant; Abraham enters Canaan" },
    ],
    locations: [{ location: 'Haran 2 F2 — Canaan 7; 11 D8' }],
  },
  // Genesis 15
  '1-15': {
    events: [
      { year: '1932 B.C.E', event: 'Covenant between the pieces' },
    ],
  },
  // Genesis 16
  '1-16': {
    events: [
      { year: '1932 B.C.E', event: 'Birth of Ishmael' },
    ],
  },
  // Genesis 17-18
  '1-17': {
    events: [
      { year: '1919 B.C.E', event: 'Covenant of circumcision' },
    ],
  },
  '1-18': {
    events: [
      { year: '1919 B.C.E', event: 'Angels visit Abraham' },
    ],
    locations: [{ location: 'Mamre (Hebron) 11 C10' }],
  },
  // Genesis 19
  '1-19': {
    events: [
      { year: '1919 B.C.E', event: 'Destruction of Sodom and Gomorrah' },
    ],
    locations: [{ location: 'Sodom 7; 19 E13' }],
  },
  // Genesis 21
  '1-21': {
    events: [
      { year: '1918 B.C.E', event: 'Birth of Isaac' },
    ],
  },
  // Genesis 22
  '1-22': {
    events: [
      { year: 'c. 1893 B.C.E', event: 'Abraham offers up Isaac' },
    ],
    locations: [{ location: 'Moriah 11 C8' }],
  },
  // Genesis 25
  '1-25': {
    events: [
      { year: '1858 B.C.E', event: 'Birth of Jacob and Esau' },
      { year: '1843 B.C.E', event: 'Death of Abraham' },
    ],
  },
  // Genesis 37
  '1-37': {
    events: [
      { year: 'c. 1750 B.C.E', event: 'Joseph sold into slavery' },
    ],
    locations: [{ location: 'Dothan 11 C5 — Egypt 11 A12' }],
  },
  // Genesis 41
  '1-41': {
    events: [
      { year: '1737 B.C.E', event: 'Joseph interprets Pharaoh\'s dreams' },
    ],
  },
  // Genesis 50
  '1-50': {
    events: [
      { year: '1657 B.C.E', event: 'Death of Jacob' },
    ],
  },
  // Exodus 1-2
  '2-1': {
    events: [
      { year: '1593 B.C.E', event: 'Birth of Moses' },
    ],
    locations: [{ location: 'Egypt 11 A12' }],
  },
  '2-3': {
    events: [
      { year: '1514 B.C.E', event: 'Burning bush; Moses commissioned' },
    ],
    locations: [{ location: 'Horeb (Sinai) 11 D16' }],
  },
  // Exodus 12
  '2-12': {
    events: [
      { year: '1513 B.C.E', event: 'Passover instituted; Exodus begins' },
    ],
  },
  // Exodus 14
  '2-14': {
    events: [
      { year: '1513 B.C.E', event: 'Crossing of the Red Sea' },
    ],
    locations: [{ location: 'Red Sea 11 C15' }],
  },
  // Exodus 20
  '2-20': {
    events: [
      { year: '1513 B.C.E', event: 'Ten Commandments given' },
    ],
    locations: [{ location: 'Mount Sinai 11 D16' }],
  },
  // 1 Chronicles 1
  '13-1': {
    events: [
      { year: 'c. 4026–2370 B.C.E', event: 'Genealogies from Adam through Noah' },
    ],
  },
};

// Tagalog versions of events
const CHAPTER_EVENTS_TG: Record<string, ChapterEventData> = {
  '1-1': {
    events: [
      { year: 'c. 46026 B.C.E', event: '"Sa simula ay nilalang ng Diyos ang langit at ang lupa"' },
    ],
  },
  '1-2': {
    events: [
      { year: '4026 B.C.E', event: 'Paglikha kay Adan' },
    ],
    locations: [{ location: 'Eden 5 F3' }],
  },
  '1-3': {
    events: [
      { year: 'c. 3896 B.C.E', event: 'Paghihimagsik sa Eden' },
    ],
    locations: [{ location: 'Eden 5 F3' }],
  },
  '1-4': {
    events: [
      { year: 'c. 3896 B.C.E', event: 'Pinatay ni Cain si Abel' },
      { year: '3896 B.C.E', event: 'Kapanganakan ni Set' },
      { year: '3404 B.C.E', event: 'Kapanganakan ni Enoc na matuwid' },
      { year: '3339 B.C.E', event: 'Kapanganakan ni Metusela' },
      { year: '3152 B.C.E', event: 'Kapanganakan ni Lamec' },
    ],
  },
  '1-5': {
    events: [
      { year: '3096 B.C.E', event: 'Kamatayan ni Adan' },
      { year: '3039 B.C.E', event: 'Paglipat kay Enoc' },
      { year: '2970 B.C.E', event: 'Kapanganakan ni Noe' },
    ],
    locations: [{ location: 'Eden 5 F3' }],
  },
  '1-6': {
    events: [
      { year: '2490 B.C.E', event: 'Kapasyahan ng Diyos tungkol sa sangkatauhan' },
      { year: '2470 B.C.E', event: 'Kapanganakan ni Japet' },
      { year: '2468 B.C.E', event: 'Kapanganakan ni Sem' },
      { year: '2370 B.C.E', event: 'Kamatayan ni Metusela' },
    ],
  },
  '1-7': {
    events: [
      { year: '2370 B.C.E', event: 'Pagbuhos ng tubig ng Baha (sa taglagas)' },
    ],
    locations: [{ location: 'Ararat 5 G2' }],
  },
  '1-8': {
    events: [
      { year: '2369 B.C.E', event: 'Paggawa ng tipan pagkatapos ng Baha' },
    ],
    locations: [{ location: 'Canaan 7; 11 D8' }],
  },
  '1-11': {
    events: [
      { year: 'c. 2269 B.C.E', event: 'Tore ng Babel; pagkalito ng mga wika' },
      { year: '2018 B.C.E', event: 'Kapanganakan ni Abraham' },
    ],
    locations: [{ location: 'Babel (Babilonya) 7 G4; 11 E3' }],
  },
  '1-12': {
    events: [
      { year: '1943 B.C.E', event: 'Tipan ni Abraham; pumasok si Abraham sa Canaan' },
    ],
    locations: [{ location: 'Haran 2 F2 — Canaan 7; 11 D8' }],
  },
};

/**
 * Get historical events for a specific chapter.
 */
export function getChapterEvents(bookId: number, chapter: number, lang: string): ChapterEventData | null {
  const key = `${bookId}-${chapter}`;
  if (lang === 'tg') {
    return CHAPTER_EVENTS_TG[key] || CHAPTER_EVENTS[key] || null;
  }
  return CHAPTER_EVENTS[key] || null;
}
