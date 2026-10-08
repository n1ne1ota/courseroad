'use client';

import { useEffect, useRef, useState } from 'react';

import type { QuizQuestion } from '../quiz-player-types';

/**
 * Regex that matches `<pre...><code class="language-xxx">...</code></pre>` blocks.
 *
 * Capture groups:
 *  1 – attributes on `<pre>` (may be empty)
 *  2 – full `<code>` opening tag
 *  3 – language identifier (e.g. "cpp")
 *  4 – inner code text (may contain HTML entities)
 */
const CODE_BLOCK_RE = /<pre([^>]*)>\s*(<code\s+class="language-(\w+)"[^>]*>)([\s\S]*?)<\/code>\s*<\/pre>/gi;

/** Decode HTML entities (`&lt;`, `&gt;`, `&amp;`, `&quot;`) to plain text. */
function decodeEntities(html: string): string {
    return html
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

/**
 * Pre-highlights all code blocks in quiz prompts before render.
 *
 * Returns a `Map<questionId, highlightedHtml>` that is populated
 * asynchronously after Shiki lazy-loads. Until then, the raw
 * `question.prompt` is used (callers should fall back to it).
 *
 * **Why this exists**: `HtmlContent`'s `useEffect` post-processing
 * mutates the DOM after first paint, causing a visible flash of
 * unstyled code — especially jarring during animated question
 * transitions. By pre-processing the HTML strings, the first render
 * already contains Shiki-highlighted markup.
 */
export function useHighlightedPrompts(questions: QuizQuestion[]): Map<string, string> {
    const [highlighted, setHighlighted] = useState<Map<string, string>>(() => new Map());
    const cacheRef = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        let cancelled = false;

        import('shiki/bundle/web').then(async ({ codeToHtml }) => {
            if (cancelled) return;

            const updates = new Map<string, string>();

            for (const question of questions) {
                if (cancelled) return;

                // Skip if already cached
                if (cacheRef.current.has(question.id)) {
                    const cached = cacheRef.current.get(question.id);
                    if (cached) updates.set(question.id, cached);
                    continue;
                }

                // Skip prompts with no code blocks
                if (!CODE_BLOCK_RE.test(question.prompt)) {
                    continue;
                }
                // Reset regex lastIndex after test()
                CODE_BLOCK_RE.lastIndex = 0;

                let processedHtml = question.prompt;
                const matches = [...question.prompt.matchAll(CODE_BLOCK_RE)];

                for (const match of matches) {
                    if (cancelled) return;

                    const fullMatch = match[0];
                    const lang = match[3] ?? 'text';
                    const rawCode = decodeEntities(match[4] ?? '');

                    try {
                        const shikiHtml = await codeToHtml(rawCode, {
                            lang,
                            themes: { dark: 'github-dark', light: 'github-light' }
                        });
                        processedHtml = processedHtml.replace(fullMatch, shikiHtml);
                    } catch {
                        // Unsupported language — try with 'text' fallback
                        try {
                            const fallbackHtml = await codeToHtml(rawCode, {
                                lang: 'text',
                                themes: { dark: 'github-dark', light: 'github-light' }
                            });
                            processedHtml = processedHtml.replace(fullMatch, fallbackHtml);
                        } catch {
                            // Leave the original code block as-is
                        }
                    }
                }

                if (processedHtml !== question.prompt) {
                    cacheRef.current.set(question.id, processedHtml);
                    updates.set(question.id, processedHtml);
                }
            }

            if (!cancelled && updates.size > 0) {
                setHighlighted(prev => {
                    const next = new Map(prev);
                    for (const [id, html] of updates) {
                        next.set(id, html);
                    }
                    return next;
                });
            }
        });

        return () => {
            cancelled = true;
        };
    }, [questions]);

    return highlighted;
}
