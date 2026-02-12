import JSZip from 'jszip';

interface SpineEntry {
  index: number;
  href: string;
}

export interface SectionContent {
  title: string;
  html: string;
}

let sectionsCache: Record<string, SectionContent> | null = null;
let sectionPromise: Promise<Record<string, SectionContent>> | null = null;

const EPUB_PATH = '/bibles/nwt_TG.epub';
const CUSTOM_SECTIONS_KEY = 'nwt-custom-bible-sections';

// Map sub-tab IDs to spine href patterns
const SECTION_PATTERNS: Record<string, RegExp[]> = {
  introduksiyon: [/introduction/i, /introduk/i, /preface/i],
  indise: [/index/i, /indise/i, /glossary/i, /glosaryo/i],
  'apendise-a': [/appendix.*a/i, /apendise.*a/i, /appa/i],
  'apendise-b': [/appendix.*b/i, /apendise.*b/i, /appb/i],
  'apendise-c': [/appendix.*c/i, /apendise.*c/i, /appc/i],
};

function extractBody(xhtml: string): string {
  const bodyMatch = xhtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let html = bodyMatch ? bodyMatch[1] : xhtml;

  html = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<link[^>]*\/?>/gi, '')
    .replace(/<meta[^>]*\/?>/gi, '')
    .replace(/<img[^>]*>/gi, '');

  return html;
}

export async function loadEpubSections(): Promise<Record<string, SectionContent>> {
  if (sectionsCache) return sectionsCache;
  if (sectionPromise) return sectionPromise;

  sectionPromise = (async () => {
    try {
      const response = await fetch(EPUB_PATH);
      const arrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Find OPF
      let opfPath = '';
      const containerXml = await zip.file('META-INF/container.xml')?.async('string');
      if (containerXml) {
        const match = containerXml.match(/full-path="([^"]+\.opf)"/);
        if (match) opfPath = match[1];
      }
      if (!opfPath) {
        for (const p of ['content.opf', 'OEBPS/content.opf', 'OPS/content.opf']) {
          if (zip.file(p)) { opfPath = p; break; }
        }
      }

      const contentPrefix = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
      const opfXml = await zip.file(opfPath)?.async('string');
      if (!opfXml) throw new Error('Could not read OPF');

      const parser = new DOMParser();
      const opfDoc = parser.parseFromString(opfXml, 'application/xml');

      const manifestMap: Record<string, string> = {};
      opfDoc.querySelectorAll('manifest item').forEach(item => {
        const id = item.getAttribute('id') || '';
        const href = item.getAttribute('href') || '';
        manifestMap[id] = href;
      });

      const spineEntries: SpineEntry[] = [];
      opfDoc.querySelectorAll('spine itemref').forEach((ref, index) => {
        const idref = ref.getAttribute('idref') || '';
        const href = manifestMap[idref] || '';
        spineEntries.push({ index, href });
      });

      const sections: Record<string, SectionContent> = {};

      // Log all spine hrefs for debugging
      const allHrefs = spineEntries.map(e => e.href);
      console.log('[EPUB Sections] All spine hrefs:', allHrefs);

      // Identify chapter content entries (they follow biblechapternav patterns)
      const chapterHrefs = new Set<string>();
      for (const entry of spineEntries) {
        if (/biblechapter|chapter\d/i.test(entry.href)) {
          chapterHrefs.add(entry.href);
        }
      }

      // Non-chapter entries are candidates for sections
      const nonChapterEntries = spineEntries.filter(e => !chapterHrefs.has(e.href));
      console.log('[EPUB Sections] Non-chapter entries:', nonChapterEntries.map(e => e.href));

      // Try to identify sections by content if href patterns don't match
      for (const entry of nonChapterEntries) {
        const href = entry.href.toLowerCase();
        
        // First try pattern matching on href
        let matchedSection: string | null = null;
        for (const [sectionId, patterns] of Object.entries(SECTION_PATTERNS)) {
          if (sections[sectionId]) continue;
          for (const pattern of patterns) {
            if (pattern.test(href)) {
              matchedSection = sectionId;
              break;
            }
          }
          if (matchedSection) break;
        }

        // Load the file and try content-based matching if href didn't match
        const filePath = contentPrefix + entry.href;
        const file = zip.file(filePath);
        if (!file) continue;
        
        const xhtml = await file.async('string');
        const html = extractBody(xhtml);
        if (!html || html.trim().length < 50) continue;

        const plainContent = html.replace(/<[^>]+>/g, ' ').toLowerCase();
        const titleMatch = html.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
        const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

        if (!matchedSection) {
          // Content-based matching
          if (/introduk|paunang\s*salita|preface|foreword/i.test(plainContent.slice(0, 500)) || /introduk/i.test(title)) {
            matchedSection = 'introduksiyon';
          } else if (/indise|index|talaan.*paksa/i.test(plainContent.slice(0, 500)) || /indise|index/i.test(title)) {
            matchedSection = 'indise';
          } else if (/apendise.*a|appendix.*a/i.test(title) || (/apendise|appendix/i.test(title) && !sections['apendise-a'] && !sections['apendise-b'] && !sections['apendise-c'])) {
            matchedSection = 'apendise-a';
          } else if (/apendise.*b|appendix.*b/i.test(title)) {
            matchedSection = 'apendise-b';
          } else if (/apendise.*c|appendix.*c/i.test(title)) {
            matchedSection = 'apendise-c';
          }
        }

        if (matchedSection && !sections[matchedSection]) {
          sections[matchedSection] = { title: title || matchedSection.toUpperCase(), html };
        } else if (matchedSection && sections[matchedSection]) {
          // Append to existing section
          sections[matchedSection].html += html;
        }
      }

      // Old appendix sub-page collector removed — handled in main loop above

      sectionsCache = sections;
      console.log(`[EPUB Sections] Found ${Object.keys(sections).length} sections:`, Object.keys(sections));
      return sections;
    } catch (err) {
      console.error('[EPUB Sections] Error:', err);
      sectionPromise = null;
      return {};
    }
  })();

  return sectionPromise;
}

export async function loadSection(sectionId: string): Promise<SectionContent | null> {
  // Check custom (uploaded) sections first
  const custom = getCustomSections();
  if (custom[sectionId]) return custom[sectionId];
  
  const sections = await loadEpubSections();
  return sections[sectionId] || null;
}

// Custom sections management (from uploaded PDF/EPUB)
export function getCustomSections(): Record<string, SectionContent> {
  try {
    const stored = localStorage.getItem(CUSTOM_SECTIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

export function saveCustomSections(sections: Record<string, SectionContent>) {
  localStorage.setItem(CUSTOM_SECTIONS_KEY, JSON.stringify(sections));
  // Invalidate cache so next load merges custom data
  sectionsCache = null;
  sectionPromise = null;
}

export function clearCustomSections() {
  localStorage.removeItem(CUSTOM_SECTIONS_KEY);
  sectionsCache = null;
  sectionPromise = null;
}

export function getCustomSectionCount(): number {
  return Object.keys(getCustomSections()).length;
}

/**
 * Parse a PDF file and extract Bible sections.
 * Uses pdfjs-dist to extract text and categorize into sections.
 */
export async function parseBiblePdf(file: File): Promise<Record<string, SectionContent>> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  
  // Set worker
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString();
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  
  const sections: Record<string, SectionContent> = {};
  let currentSection: string | null = null;
  let currentTitle = '';
  let currentHtml = '';
  
  const SECTION_TRIGGERS: { pattern: RegExp; id: string; label: string }[] = [
    { pattern: /introduk|paunang\s*salita|preface/i, id: 'introduksiyon', label: 'Introduksiyon' },
    { pattern: /indise|index|talaan.*paksa/i, id: 'indise', label: 'Indise' },
    { pattern: /apendise\s*a|appendix\s*a/i, id: 'apendise-a', label: 'Apendise A' },
    { pattern: /apendise\s*b|appendix\s*b/i, id: 'apendise-b', label: 'Apendise B' },
    { pattern: /apendise\s*c|appendix\s*c/i, id: 'apendise-c', label: 'Apendise C' },
  ];
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .trim();
    
    if (!pageText) continue;
    
    // Check if this page starts a new section
    const firstLine = pageText.slice(0, 200);
    let foundNewSection = false;
    
    for (const trigger of SECTION_TRIGGERS) {
      if (trigger.pattern.test(firstLine)) {
        // Save previous section
        if (currentSection && currentHtml.trim()) {
          sections[currentSection] = { title: currentTitle, html: currentHtml };
        }
        currentSection = trigger.id;
        currentTitle = trigger.label;
        currentHtml = '';
        foundNewSection = true;
        break;
      }
    }
    
    if (currentSection) {
      // Convert page text to HTML paragraphs
      const paragraphs = pageText.split(/\n\n|\r\n\r\n/).filter(p => p.trim());
      for (const para of paragraphs) {
        currentHtml += `<p>${para.replace(/\n/g, ' ').trim()}</p>\n`;
      }
    }
  }
  
  // Save last section
  if (currentSection && currentHtml.trim()) {
    sections[currentSection] = { title: currentTitle, html: currentHtml };
  }
  
  return sections;
}

/**
 * Parse an EPUB file and extract Bible sections.
 */
export async function parseBibleEpub(file: File): Promise<Record<string, SectionContent>> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Find OPF
  let opfPath = '';
  const containerXml = await zip.file('META-INF/container.xml')?.async('string');
  if (containerXml) {
    const match = containerXml.match(/full-path="([^"]+\.opf)"/);
    if (match) opfPath = match[1];
  }
  if (!opfPath) {
    for (const p of ['content.opf', 'OEBPS/content.opf', 'OPS/content.opf']) {
      if (zip.file(p)) { opfPath = p; break; }
    }
  }
  
  const contentPrefix = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
  const opfXml = await zip.file(opfPath)?.async('string');
  if (!opfXml) throw new Error('Could not read OPF');
  
  const parser = new DOMParser();
  const opfDoc = parser.parseFromString(opfXml, 'application/xml');
  
  const manifestMap: Record<string, string> = {};
  opfDoc.querySelectorAll('manifest item').forEach(item => {
    manifestMap[item.getAttribute('id') || ''] = item.getAttribute('href') || '';
  });
  
  const spineEntries: { href: string }[] = [];
  opfDoc.querySelectorAll('spine itemref').forEach(ref => {
    const idref = ref.getAttribute('idref') || '';
    spineEntries.push({ href: manifestMap[idref] || '' });
  });
  
  const sections: Record<string, SectionContent> = {};
  
  for (const entry of spineEntries) {
    if (/biblechapter/i.test(entry.href)) continue;
    
    const filePath = contentPrefix + entry.href;
    const zipFile = zip.file(filePath);
    if (!zipFile) continue;
    
    const xhtml = await zipFile.async('string');
    const html = extractBody(xhtml);
    if (!html || html.trim().length < 50) continue;
    
    const plainContent = html.replace(/<[^>]+>/g, ' ').toLowerCase();
    const titleMatch = html.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    
    let sectionId: string | null = null;
    if (/introduk|paunang/i.test(title) || /introduk/i.test(plainContent.slice(0, 300))) sectionId = 'introduksiyon';
    else if (/indise|index/i.test(title)) sectionId = 'indise';
    else if (/apendise.*a|appendix.*a/i.test(title)) sectionId = 'apendise-a';
    else if (/apendise.*b|appendix.*b/i.test(title)) sectionId = 'apendise-b';
    else if (/apendise.*c|appendix.*c/i.test(title)) sectionId = 'apendise-c';
    
    if (sectionId) {
      if (!sections[sectionId]) {
        sections[sectionId] = { title: title || sectionId.toUpperCase(), html };
      } else {
        sections[sectionId].html += html;
      }
    }
  }
  
  return sections;
}
