'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';

export function ThemeAwareToastProvider() {
  const { systemTheme, theme } = useTheme();

  // Resolve 'system' to actual theme
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <Toaster
      // Hide the default sonner toast background/styling completely
      // since our custom render handles layout and CSS module layering natively.
      toastOptions={{
        className: 'bg-transparent border-none shadow-none p-0 !w-auto'
      }}
      position='bottom-right'
      theme={isDark ? 'dark' : 'light'}
    />
  );
}
