'use client';

import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';

import { codeToHtml } from 'shiki/bundle/web';

interface CodeOptionDisplayProps {
  /** The raw code string to highlight. */
  code: string;
  /** The Shiki language identifier (e.g. 'javascript', 'cpp'). */
  language: string;
}

/**
 * Renders a code option with Shiki syntax highlighting.
 *
 * Uses async `codeToHtml` with a local cache to avoid re-highlighting
 * identical code+language pairs across question navigations.
 */
export function CodeOptionDisplay({ code, language }: CodeOptionDisplayProps): JSX.Element {
  const [html, setHtml] = useState('');
  const cacheRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!code) {
      return;
    }

    const cacheKey = `${language}:${code}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setHtml(cached);
      return;
    }

    let cancelled = false;

    codeToHtml(code, {
      lang: language,
      themes: { dark: 'github-dark', light: 'github-light' }
    })
      .then(result => {
        if (!cancelled) {
          cacheRef.current.set(cacheKey, result);
          setHtml(result);
        }
      })
      .catch(() => {
        // Unsupported language — try again with 'text' as a safe fallback
        if (!cancelled && language !== 'text') {
          codeToHtml(code, {
            lang: 'text',
            themes: { dark: 'github-dark', light: 'github-light' }
          })
            .then(result => {
              if (!cancelled) {
                cacheRef.current.set(cacheKey, result);
                setHtml(result);
              }
            })
            .catch(() => {
              if (!cancelled) setHtml('');
            });
        } else if (!cancelled) {
          setHtml('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  return (
    <div
      className='overflow-x-auto rounded-md bg-[var(--tt-codeblock-bg,hsl(var(--muted)))] px-3 py-2 font-mono text-sm [&_.shiki]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0'
      dangerouslySetInnerHTML={{ __html: html || escapeHtml(code) }}
    />
  );
}

/** Escape raw code for safe fallback rendering before Shiki loads. */
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
