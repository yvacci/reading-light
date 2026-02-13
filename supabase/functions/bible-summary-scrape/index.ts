const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookNum, chapter } = await req.json();

    if (!bookNum) {
      return new Response(
        JSON.stringify({ success: false, error: 'bookNum is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chapter outline: scrape the study pane of the chapter page
    // Book summary: scrape the book's chapter 1 page (outline covers whole book in study pane)
    const targetCh = chapter || 1;
    const url = `https://wol.jw.org/tl/wol/b/r27/lp-tg/nwtsty/${bookNum}/${targetCh}`;
    console.log('Scraping bible summary:', url);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['html'],
        onlyMainContent: false,
        waitFor: 2000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = data.data?.html || data.html || '';

    // Extract chapter outline from summaryOutline section
    // Structure: <div class="summaryOutline"><ul class="content"><li>...<li class="L2"><p>Heading (verses)</p></li>...</li></ul></div>
    const outline: { heading: string; verses: string }[] = [];
    const outlineMatch = html.match(/<div[^>]*class="[^"]*summaryOutline[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (outlineMatch) {
      const outlineHtml = outlineMatch[1];
      // Match L2 items which contain the actual section headings
      const l2Regex = /<li[^>]*class="[^"]*L2[^"]*"[^>]*>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi;
      let l2Match;
      while ((l2Match = l2Regex.exec(outlineHtml)) !== null) {
        const rawText = l2Match[1];
        // Extract heading text and verse range
        const cleanText = rawText
          .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')
          .replace(/<span[^>]*class="[^"]*altsize[^"]*"[^>]*>/gi, '')
          .replace(/<\/span>/gi, '')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/\u00A0/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Split heading and verse range: "Salita ng buhay (1-4)"
        const verseMatch = cleanText.match(/^(.+?)\s*\((\d[\d\s,;-]*)\)\s*$/);
        if (verseMatch) {
          outline.push({ heading: verseMatch[1].trim(), verses: verseMatch[2].trim() });
        } else {
          outline.push({ heading: cleanText, verses: '' });
        }
      }
    }

    // If no chapter specified, also build a book-level summary from the outlines of all chapters
    if (!chapter) {
      // Try to extract a title for the book
      const navMatch = html.match(/class="[^"]*navChapter[^"]*"[^>]*>[\s\S]*?<a[^>]*>[^<]*?([\w\s]+\d+)<\/a>/i);
      const bookTitle = navMatch ? navMatch[1].replace(/\d+$/, '').trim() : '';

      console.log('Book summary parsed, outline items:', outline.length);
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            title: bookTitle,
            outline,
            summary: outline.length > 0
              ? outline.map(o => `${o.heading}${o.verses ? ` (${o.verses})` : ''}`).join(' · ')
              : '',
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Chapter outline parsed, items:', outline.length);
    return new Response(
      JSON.stringify({ success: true, data: { outline } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping bible summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
