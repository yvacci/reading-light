import type { Footnote } from '@/components/FootnotesPanel';

/**
 * Parse footnotes from NWT EPUB chapter HTML.
 * 
 * NWT EPUB footnote patterns:
 * - Inline markers: <a id="XXXX" href="#">*</a>
 * - Footer definitions: Lines starting with ^ followed by reference and content
 *   e.g. "^ Gen. 1:1 O "nilikha.""
 * 
 * Returns { cleanHtml, footnotes } where cleanHtml has footnote definitions removed
 * but inline markers converted to tappable superscript indicators.
 */
export function parseFootnotes(html: string): { cleanHtml: string; footnotes: Footnote[] } {
  const footnotes: Footnote[] = [];

  // Extract footnote definitions from the bottom of the content
  // Pattern: text content that starts with ^ followed by book reference
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

  // Remove the footnote section from the HTML
  // The footnotes appear at the bottom as plain text lines starting with ^
  // They're typically in the last few <p> tags or after the main content
  let cleanHtml = html;

  // Remove paragraphs/elements that contain footnote definitions
  // Look for elements containing "^ BookName Ch:Vs"
  cleanHtml = cleanHtml.replace(
    /<p[^>]*>\s*\^[^<]*<\/p>/gi,
    ''
  );

  // Also handle footnotes that appear as loose text at the end
  // Remove blocks of ^ footnotes that might be in a single container
  cleanHtml = cleanHtml.replace(
    /(<div[^>]*>)?\s*(\^[^<^]+(?:<[^>]*>[^<]*<\/[^>]*>)*[^<^]*)+\s*(<\/div>)?/gi,
    (match) => {
      // Only remove if it looks like footnote content (contains ^ references)
      if (/\^\s+\w+\.?\s+\d+:\d+/.test(match)) {
        return '';
      }
      return match;
    }
  );

  // Style inline footnote markers (* symbols) as tappable indicators
  // Pattern: <a id="XXXX" href="#">*</a>
  cleanHtml = cleanHtml.replace(
    /<a\s+id="(\d+)"\s*(?:href="[^"]*")?\s*>\s*\*\s*<\/a>/gi,
    (_, id) => {
      const fnIdx = getFootnoteIndexForMarker(id, footnotes, html);
      if (fnIdx >= 0) {
        return `<span class="footnote-marker" data-fn-id="fn_${fnIdx}" title="View footnote">*</span>`;
      }
      return `<span class="footnote-marker">*</span>`;
    }
  );

  return { cleanHtml, footnotes };
}

/**
 * Try to match an inline marker to its footnote definition by position.
 * Markers appear in order, so the Nth marker maps to the Nth footnote.
 */
function getFootnoteIndexForMarker(
  markerId: string,
  footnotes: Footnote[],
  html: string
): number {
  // Find all marker IDs in order
  const markerRegex = /<a\s+id="(\d+)"\s*(?:href="[^"]*")?\s*>\s*\*\s*<\/a>/gi;
  const markerIds: string[] = [];
  let m;
  while ((m = markerRegex.exec(html)) !== null) {
    markerIds.push(m[1]);
  }

  const idx = markerIds.indexOf(markerId);
  return idx >= 0 && idx < footnotes.length ? idx : -1;
}
