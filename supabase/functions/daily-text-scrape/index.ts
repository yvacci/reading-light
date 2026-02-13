const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { year, month, day } = await req.json();

    if (!year || !month || !day) {
      return new Response(
        JSON.stringify({ success: false, error: 'year, month, day are required' }),
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

    const url = `https://wol.jw.org/tl/wol/dt/r27/lp-tg/${year}/${month}/${day}`;
    console.log('Scraping daily text:', url);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['html'],
        onlyMainContent: true,
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

    // Parse the daily text from the HTML
    const html = data.data?.html || data.html || '';
    
    // Extract the theme scripture (title)
    const titleMatch = html.match(/<p[^>]*class="[^"]*themeScrp[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    let title = '';
    if (titleMatch) {
      title = titleMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Extract body text
    const bodyMatch = html.match(/<div[^>]*class="[^"]*bodyTxt[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>|$)/i);
    let content = '';
    if (bodyMatch) {
      // Get only the first bodyTxt div (daily text), not meeting workbook
      const firstBodyTxt = bodyMatch[0];
      // Extract paragraphs
      const paragraphs: string[] = [];
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
      let pMatch;
      while ((pMatch = pRegex.exec(firstBodyTxt)) !== null) {
        const text = pMatch[1]
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/\u00A0/g, ' ')
          .replace(/\u200B/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (text) paragraphs.push(text);
      }
      content = paragraphs.join('\n\n');
    }

    if (!title && !content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Could not parse daily text from page' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = {
      success: true,
      data: {
        date: `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        title,
        content,
      },
    };

    console.log('Daily text parsed successfully:', title.substring(0, 50));
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping daily text:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape daily text';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
