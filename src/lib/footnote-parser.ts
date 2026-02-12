import type { Footnote } from '@/components/FootnotesPanel';

/**
 * Parse footnotes from NWT EPUB chapter HTML.
 * 
 * Aggressively removes ALL lines/elements containing the "^" symbol
 * (legacy footnote definitions), while retaining inline markers (*).
 */
export function parseFootnotes(html: string): { cleanHtml: string; footnotes: Footnote[] } {
  const footnotes: Footnote[] = [];

  // Extract footnote definitions from the content
  const plainText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  
  // Find all footnote definitions: ^ Book Ch:Vs Content
  const fnRegex = /\^\s+([\w.]+\s+\d+:\d+[a-z]?)\s+(.*?)(?=\^\s+[\w.]+\s+\d+:\d+|$)/g;
  let fnMatch;
  let fnIndex = 0;

  // Use a Set to deduplicate footnotes by reference+content
  const seenFootnotes = new Set<string>();

  while ((fnMatch = fnRegex.exec(plainText)) !== null) {
    const reference = fnMatch[1].trim();
    const content = fnMatch[2].trim();
    if (reference && content) {
      const key = `${reference}|${content}`;
      if (!seenFootnotes.has(key)) {
        seenFootnotes.add(key);
        footnotes.push({
          id: `fn_${fnIndex}`,
          reference,
          content,
        });
        fnIndex++;
      }
    }
  }

  // Clean the HTML — aggressively remove ALL content with ^ symbols
  let cleanHtml = html;

  // Remove any paragraph, div, span, or other element containing ^
  cleanHtml = cleanHtml.replace(/<p[^>]*>[^<]*\^[^<]*(<[^>]*>[^<]*)*<\/p>/gi, '');
  cleanHtml = cleanHtml.replace(/<div[^>]*>[^<]*\^[^<]*(<[^>]*>[^<]*)*<\/div>/gi, '');
  cleanHtml = cleanHtml.replace(/<span[^>]*>[^<]*\^[^<]*(<[^>]*>[^<]*)*<\/span>/gi, '');
  
  // Remove any remaining loose text lines containing ^
  cleanHtml = cleanHtml.replace(/\^[^<\n]*/g, '');
  
  // Remove standalone footnote reference paragraphs (e.g., "Gen. 1:16 Lit., 'para maghari.'")
  // These appear as separate paragraphs with a book abbreviation + chapter:verse pattern
  cleanHtml = cleanHtml.replace(/<p[^>]*>[\s\S]*?<\/p>/gi, (match) => {
    const stripped = match.replace(/<[^>]+>/g, '').trim();
    // Match patterns like "Gen. 1:16 ..." or "1Co. 3:5 ..." — standalone footnote lines
    if (/^(?:\d?\s*)?[A-Z][a-z]{1,5}\.?\s+\d+:\d+[a-z]?\s+/i.test(stripped) && stripped.length < 300) {
      // Ensure it's not a real verse paragraph by checking it doesn't start with a verse number only
      if (!/^\d+\s+[A-Z]/.test(stripped)) {
        return '';
      }
    }
    return match;
  });
  
  // Remove empty paragraphs and divs left behind
  cleanHtml = cleanHtml.replace(/<p[^>]*>\s*<\/p>/gi, '');
  cleanHtml = cleanHtml.replace(/<div[^>]*>\s*<\/div>/gi, '');

  // Style inline footnote markers (* symbols) as tappable indicators with data attributes
  // Pattern: <a id="XXXX" href="#">*</a>
  cleanHtml = cleanHtml.replace(
    /<a\s+id="(\d+)"\s*(?:href="[^"]*")?\s*>\s*\*\s*<\/a>/gi,
    (_, id) => {
      const fnIdx = getFootnoteIndexForMarker(id, footnotes, html);
      if (fnIdx >= 0) {
        return `<span class="footnote-marker" data-fn-id="fn_${fnIdx}" data-fn-index="${fnIdx}" title="View footnote">*</span>`;
      }
      return `<span class="footnote-marker">*</span>`;
    }
  );

  return { cleanHtml, footnotes };
}

/**
 * Try to match an inline marker to its footnote definition by position.
 */
function getFootnoteIndexForMarker(
  markerId: string,
  footnotes: Footnote[],
  html: string
): number {
  const markerRegex = /<a\s+id="(\d+)"\s*(?:href="[^"]*")?\s*>\s*\*\s*<\/a>/gi;
  const markerIds: string[] = [];
  let m;
  while ((m = markerRegex.exec(html)) !== null) {
    markerIds.push(m[1]);
  }

  const idx = markerIds.indexOf(markerId);
  return idx >= 0 && idx < footnotes.length ? idx : -1;
}
