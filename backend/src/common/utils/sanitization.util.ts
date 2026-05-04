import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

export const ALLOWED_MARKDOWN_HTML_TAGS = Object.freeze([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
] as const);

export const ALLOWED_MARKDOWN_HTML_ATTRIBUTES = Object.freeze([
  'href',
  'rel',
  'target',
  'title',
] as const);

export class SanitizationUtil {
  static cleanMarkdown(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [...ALLOWED_MARKDOWN_HTML_TAGS],
      ALLOWED_ATTR: [...ALLOWED_MARKDOWN_HTML_ATTRIBUTES],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
      FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover'],
      RETURN_TRUSTED_TYPE: false,
    }).trim();
  }
}
