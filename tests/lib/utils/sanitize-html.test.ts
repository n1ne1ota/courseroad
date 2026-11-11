import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from '@/lib/utils/sanitize';

describe('sanitizeHtml', () => {
    describe('allowed tags', () => {
        it('preserves paragraph tags', () => {
            expect(sanitizeHtml('<p>Hello world</p>')).toBe('<p>Hello world</p>');
        });

        it('preserves heading tags', () => {
            expect(sanitizeHtml('<h1>Title</h1>')).toBe('<h1>Title</h1>');
            expect(sanitizeHtml('<h3>Subtitle</h3>')).toBe('<h3>Subtitle</h3>');
        });

        it('preserves inline formatting', () => {
            expect(sanitizeHtml('<strong>bold</strong>')).toBe('<strong>bold</strong>');
            expect(sanitizeHtml('<em>italic</em>')).toBe('<em>italic</em>');
            expect(sanitizeHtml('<u>underline</u>')).toBe('<u>underline</u>');
            expect(sanitizeHtml('<s>strikethrough</s>')).toBe('<s>strikethrough</s>');
        });

        it('preserves links with href', () => {
            const input = '<a href="https://example.com">link</a>';

            expect(sanitizeHtml(input)).toBe(input);
        });

        it('preserves code blocks', () => {
            expect(sanitizeHtml('<pre><code>const x = 1;</code></pre>')).toBe('<pre><code>const x = 1;</code></pre>');
        });

        it('preserves images with src and alt', () => {
            const input = '<img src="photo.jpg" alt="A photo">';

            expect(sanitizeHtml(input)).toContain('src="photo.jpg"');
            expect(sanitizeHtml(input)).toContain('alt="A photo"');
        });

        it('preserves lists', () => {
            const input = '<ul><li>one</li><li>two</li></ul>';

            expect(sanitizeHtml(input)).toBe(input);
        });

        it('preserves mark and span for highlights', () => {
            expect(sanitizeHtml('<mark>highlighted</mark>')).toBe('<mark>highlighted</mark>');
            expect(sanitizeHtml('<span>text</span>')).toBe('<span>text</span>');
        });
    });

    describe('disallowed tags', () => {
        it('strips script tags', () => {
            expect(sanitizeHtml('<script>alert(1)</script>')).toBe('');
        });

        it('strips iframe tags', () => {
            expect(sanitizeHtml('<iframe src="evil.html"></iframe>')).toBe('');
        });

        it('strips object tags', () => {
            expect(sanitizeHtml('<object data="malware.swf"></object>')).toBe('');
        });

        it('strips embed tags', () => {
            expect(sanitizeHtml('<embed src="plugin.swf">')).toBe('');
        });

        it('strips form tags but keeps inner text', () => {
            expect(sanitizeHtml('<form><input type="text"></form>')).toBe('');
        });
    });

    describe('allowed attributes', () => {
        it('preserves data-language on code blocks', () => {
            const input = '<code data-language="typescript">const x = 1;</code>';

            expect(sanitizeHtml(input)).toContain('data-language="typescript"');
        });

        it('preserves style attribute for highlights', () => {
            const input = '<span style="background-color: yellow;">highlighted</span>';

            expect(sanitizeHtml(input)).toContain('style=');
        });

        it('preserves class attribute', () => {
            const input = '<p class="paragraph">text</p>';

            expect(sanitizeHtml(input)).toContain('class="paragraph"');
        });
    });

    describe('dangerous attributes', () => {
        it('removes onclick handlers', () => {
            const result = sanitizeHtml('<p onclick="alert(1)">text</p>');

            expect(result).not.toContain('onclick');
        });

        it('removes onerror handlers', () => {
            const result = sanitizeHtml('<img src="x" onerror="alert(1)">');

            expect(result).not.toContain('onerror');
        });

        it('removes onload handlers', () => {
            const result = sanitizeHtml('<img src="x" onload="alert(1)">');

            expect(result).not.toContain('onload');
        });
    });

    describe('XSS vectors', () => {
        it('neutralizes img onerror injection', () => {
            const result = sanitizeHtml('<img src=x onerror=alert(1)>');

            expect(result).not.toContain('onerror');
        });

        it('neutralizes javascript: protocol in links', () => {
            const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');

            expect(result).not.toContain('javascript:');
        });

        it('strips nested script tags', () => {
            const result = sanitizeHtml('<div><script>document.cookie</script></div>');

            expect(result).not.toContain('script');
        });
    });

    describe('edge cases', () => {
        it('returns empty string for empty input', () => {
            expect(sanitizeHtml('')).toBe('');
        });

        it('handles plain text without tags', () => {
            expect(sanitizeHtml('just plain text')).toBe('just plain text');
        });
    });
});
