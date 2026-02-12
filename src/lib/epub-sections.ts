import JSZip from 'jszip';

interface SpineEntry {
  index: number;
  href: string;
}

interface SectionContent {
  title: string;
  html: string;
}

let sectionsCache: Record<string, SectionContent> | null = null;
let sectionPromise: Promise<Record<string, SectionContent>> | null = null;

const EPUB_PATH = '/bibles/nwt_TG.epub';

// Map sub-tab IDs to spine href patterns
const SECTION_PATTERNS: Record<string, RegExp[]> = {
  introduksiyon: [/introduction/i, /introduk/i, /preface/i],
  indise: [/index/i, /indise/i, /glossary/i, /glosaryo/i],
  'apendise-a': [/appendix.*a/i, /apendise.*a/i, /appa/i],
  'apendise-b': [/appendix.*b/i, /apendise.*b/i, /appb/i],
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

      // Find sections by matching spine hrefs against patterns
      for (const entry of spineEntries) {
        const href = entry.href.toLowerCase();
        
        for (const [sectionId, patterns] of Object.entries(SECTION_PATTERNS)) {
          if (sections[sectionId]) continue; // Already found
          
          for (const pattern of patterns) {
            if (pattern.test(href)) {
              const filePath = contentPrefix + entry.href;
              const file = zip.file(filePath);
              if (file) {
                const xhtml = await file.async('string');
                const html = extractBody(xhtml);
                if (html && html.trim().length > 50) {
                  // Extract title from first heading
                  const titleMatch = html.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
                  const title = titleMatch
                    ? titleMatch[1].replace(/<[^>]+>/g, '').trim()
                    : sectionId.toUpperCase();
                  
                  sections[sectionId] = { title, html };
                }
              }
              break;
            }
          }
        }
      }

      // Also try to collect multiple pages for appendices (they may span multiple spine entries)
      for (const entry of spineEntries) {
        const href = entry.href.toLowerCase();
        
        // Check for appendix sub-pages not yet captured
        if (/app[a-c]|apendise/i.test(href) && !Object.values(SECTION_PATTERNS).flat().some(p => p.test(href))) {
          // This is an additional appendix page
          const filePath = contentPrefix + entry.href;
          const file = zip.file(filePath);
          if (file) {
            const xhtml = await file.async('string');
            const html = extractBody(xhtml);
            if (html && html.trim().length > 50) {
              // Determine which appendix this belongs to
              let targetSection = '';
              if (/appa|appendix.*a/i.test(href)) targetSection = 'apendise-a';
              else if (/appb|appendix.*b/i.test(href)) targetSection = 'apendise-b';
              
              if (targetSection && sections[targetSection]) {
                sections[targetSection].html += html;
              }
            }
          }
        }
      }

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
  const sections = await loadEpubSections();
  return sections[sectionId] || null;
}
