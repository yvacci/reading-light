// Bundled Bible section data scraped from jw.org (with approval)
// Source: https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/

export interface SectionArticle {
  title: string;
  url: string;
}

export interface BibleSectionData {
  title: string;
  description?: string;
  articles: SectionArticle[];
  sourceUrl: string;
}

export const BIBLE_SECTIONS: Record<string, BibleSectionData> = {
  introduksiyon: {
    title: 'Introduksiyon sa Salita ng Diyos',
    description: 'Sinasagot ng Bibliya ang mga tanong na: Sino ang Diyos? Sino ang sumulat ng Bibliya? Bakit nagdurusa ang tao? Ano ang nangyayari sa atin kapag namatay tayo?',
    sourceUrl: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/',
    articles: [
      { title: 'Sino ang Diyos?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/sino-ang-diyos/' },
      { title: 'Paano ka matututo tungkol sa Diyos?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/matuto-tungkol-diyos/' },
      { title: 'Sino ang awtor ng Bibliya?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/sino-awtor-bibliya/' },
      { title: 'Tama ba ang sinasabi ng Bibliya pagdating sa siyensiya?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/bibliya-at-siyensiya/' },
      { title: 'Ano ang mensahe ng Bibliya?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/mensahe-ng-bibliya/' },
      { title: 'Ano ang inihula ng Bibliya tungkol sa Mesiyas?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/hula-sa-mesiyas/' },
      { title: 'Ano ang inihula ng Bibliya tungkol sa panahon natin?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/hula-bibliya-panahon-kawakasan/' },
      { title: 'Dapat bang isisi sa Diyos ang pagdurusa ng mga tao?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/isisi-sa-diyos/' },
      { title: 'Bakit nagdurusa ang mga tao?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/pagdurusa-tao/' },
      { title: 'Ano ang ipinapangako ng Bibliya na mangyayari sa hinaharap?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/pangako-diyos-sa-hinaharap/' },
      { title: 'Ano ang nangyayari sa isang tao kapag namatay siya?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/ano-nangyayari-kapag-namatay-tao/' },
      { title: 'Ano ang pag-asa para sa mga patay?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/pag-asa-para-sa-patay/' },
      { title: 'Ano ang sinasabi ng Bibliya tungkol sa pagtatrabaho?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/sinasabi-ng-bibliya-tungkol-sa-pagtatrabaho/' },
      { title: 'Paano mo maiiwasan ang problema sa pera?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/magagandang-simulain/' },
      { title: 'Paano ka magiging maligaya?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/paano-ka-magiging-maligaya/' },
      { title: 'Paano mo maiiwasan ang sobrang pag-aalala?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/maiwasan-sobrang-pag-aalala/' },
      { title: 'Paano makatutulong ang Bibliya sa pamilya mo?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/pamilya-bibliya/' },
      { title: 'Paano ka mapapalapít sa Diyos?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/paano-mapapalapit-sa-diyos/' },
      { title: 'Ano ang nilalaman ng mga aklat ng Bibliya?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/66-books-of-the-bible/' },
      { title: 'Paano ka makikinabang nang husto sa pagbabasa ng Bibliya?', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/introduksiyon/kung-paano-babasahin-ang-bibliya/' },
    ],
  },
  indise: {
    title: 'Glosaryo at Indise',
    description: 'Mga kahulugan ng mahahalagang termino sa Bibliya.',
    sourceUrl: 'https://www.jw.org/tl/library/aklat/glosari-sa-bibliya/',
    articles: [
      { title: 'Glosari sa Bibliya', url: 'https://www.jw.org/tl/library/aklat/glosari-sa-bibliya/' },
      { title: 'Talaan ng mga Aklat sa Bibliya', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/talaan-ng-mga-aklat-sa-bibliya/' },
      { title: 'Mga Daglat na Ginamit sa Talababa at Apendise', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/mga-daglat-sa-talababa-at-apendise/' },
      { title: 'Paunang Salita', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/banal-na-kasulatan-paunang-salita/' },
    ],
  },
  'apendise-a': {
    title: 'Apendise A',
    description: 'Mga artikulo tungkol sa mga prinsipyo sa pagsasalin ng Bibliya.',
    sourceUrl: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/apendise-a/',
    articles: [
      { title: 'Apendise A — Mga Prinsipyo sa Pagsasalin', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/apendise-a/' },
    ],
  },
  'apendise-b': {
    title: 'Apendise B',
    description: 'Mga mapa, tsart, at timeline na tumutulong sa pag-aaral ng Bibliya.',
    sourceUrl: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/apendise-b/',
    articles: [
      { title: 'Apendise B — Mga Mapa at Tsart', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/apendise-b/' },
    ],
  },
  'apendise-c': {
    title: 'Apendise C',
    description: 'Mga artikulo tungkol sa iba pang mga paksa sa Bibliya.',
    sourceUrl: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/apendise-c/',
    articles: [
      { title: 'Apendise C — Iba Pang Paksa', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/apendise-c/' },
    ],
  },
};
