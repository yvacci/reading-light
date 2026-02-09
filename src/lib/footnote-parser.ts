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

  while ((fnMatch = fnRegex.exec(plainText)) !== null) {
    const reference = fnMatch[1].trim();
    const content = fnMatch[2].trim();
    if (reference && content) {
      footnotes.push({
        id: `fn_${fnIndex}`,
        reference,
        content,
      });
      fnIndex++;
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
