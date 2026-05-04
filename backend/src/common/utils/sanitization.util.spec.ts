import {
  ALLOWED_MARKDOWN_HTML_ATTRIBUTES,
  ALLOWED_MARKDOWN_HTML_TAGS,
  SanitizationUtil,
} from './sanitization.util';

describe('SanitizationUtil', () => {
  describe('cleanMarkdown', () => {
    it('strips script tags while retaining markdown syntax', () => {
      const input = '# Header\n\n**bold**\n\n<script>alert(1)</script>';

      const result = SanitizationUtil.cleanMarkdown(input);

      expect(result).toContain('# Header');
      expect(result).toContain('**bold**');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert(1)');
    });

    it('keeps explicitly allowed HTML tags used by markdown renderers', () => {
      const input = '<h1>Title</h1><p>Hello <b>bold</b> <i>italic</i></p><a href="https://example.com">link</a>';

      const result = SanitizationUtil.cleanMarkdown(input);

      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<p>Hello <b>bold</b> <i>italic</i></p>');
      expect(result).toContain('<a href="https://example.com">link</a>');
    });

    it('removes dangerous event handlers and inline styles', () => {
      const input = '<p onclick="steal()" style="color:red">Safe text</p><img src=x onerror="alert(1)">';

      const result = SanitizationUtil.cleanMarkdown(input);

      expect(result).toBe('<p>Safe text</p>');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('style=');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('<img');
    });

    it('strips javascript URLs from links', () => {
      const input = '<a href="javascript:alert(1)" title="bad">click me</a>';

      const result = SanitizationUtil.cleanMarkdown(input);

      expect(result).toBe('<a title="bad">click me</a>');
      expect(result).not.toContain('javascript:');
    });

    it('retains GitHub-flavored markdown table syntax as text', () => {
      const input = '| Asset | Amount |\n| --- | ---: |\n| XLM | 100 |\n\n~~deprecated~~';

      const result = SanitizationUtil.cleanMarkdown(input);

      expect(result).toContain('| Asset | Amount |');
      expect(result).toContain('~~deprecated~~');
    });

    it('exposes immutable allow lists for auditability', () => {
      expect(Object.isFrozen(ALLOWED_MARKDOWN_HTML_TAGS)).toBe(true);
      expect(Object.isFrozen(ALLOWED_MARKDOWN_HTML_ATTRIBUTES)).toBe(true);
      expect(ALLOWED_MARKDOWN_HTML_TAGS).toEqual(
        expect.arrayContaining(['a', 'p', 'b', 'i', 'h1']),
      );
    });
  });
});
