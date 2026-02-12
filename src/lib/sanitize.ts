import DOMPurify from 'dompurify';

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'strong', 'em', 'span', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'div', 'br', 'sup', 'sub', 'ul', 'ol', 'li', 'table', 'thead', 'tbody',
    'tr', 'td', 'th', 'blockquote', 'b', 'i', 'u', 'small', 'img', 'hr',
    'section', 'article', 'header', 'footer', 'nav', 'figure', 'figcaption',
  ],
  ALLOWED_ATTR: [
    'class', 'id', 'style', 'href', 'target', 'rel',
    'data-verse', 'data-fn-id', 'data-book', 'data-chapter',
    'data-verse-num', 'data-highlighted', 'data-highlight-color',
    'src', 'alt', 'width', 'height',
  ],
};

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG) as string;
}
