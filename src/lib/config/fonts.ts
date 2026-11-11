import localFont from 'next/font/local';

// Self-hosted fonts for Next.js 15 and Turbopack compatibility
export const fontSans = localFont({
    display: 'swap',
    fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    preload: true,
    src: [
        {
            path: '../../assets/fonts/InterVariable.woff2',
            style: 'normal'
        },
        {
            path: '../../assets/fonts/InterVariable-Italic.woff2',
            style: 'italic'
        }
    ],
    variable: '--font-sans'
});

export const fontMono = localFont({
    display: 'swap',
    fallback: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
    preload: false, // Only preload if used on initial page load
    src: '../../assets/fonts/FiraCode-VF.woff2',
    variable: '--font-mono'
});
