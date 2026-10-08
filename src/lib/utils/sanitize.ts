import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content produced by the Tiptap editor.
 * Strips all non-allowed tags/attributes to prevent XSS.
 *
 * The allowed set matches what the Tiptap editor can produce:
 * headings, paragraphs, lists, code blocks, links, images,
 * inline formatting (bold, italic, underline, etc.), and highlights.
 */
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_ATTR: [
            'href',
            'target',
            'rel', // links
            'src',
            'alt',
            'title',
            'width',
            'height', // images
            'class',
            'data-language', // code blocks
            'style' // highlights (Tiptap uses inline background-color)
        ],
        ALLOWED_TAGS: [
            // Block elements
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'p',
            'br',
            'hr',
            'blockquote',
            'pre',
            'code',
            'ul',
            'ol',
            'li',
            'img',
            // Inline elements
            'a',
            'strong',
            'em',
            'u',
            's',
            'sub',
            'sup',
            'mark',
            'span'
        ]
    });
}
