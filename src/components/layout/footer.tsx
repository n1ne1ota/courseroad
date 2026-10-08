'use client';

import { Separator, ThemeSwitch } from '@courseroad/iota-ui';
import { StatusDot } from '@courseroad/kurume-ui';
import { useTheme } from 'next-themes';

import { CourseroadIcon } from '@/assets/icons/courseroad-icon';

export function Footer() {
  const { setTheme, theme } = useTheme();

  return (
    <footer className='relative z-20 flex w-full flex-col'>
      <div className='mx-auto w-full max-w-7xl px-6 py-12 lg:px-8'>
        <div className='flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between'>
          <div className='flex flex-col items-center gap-2 md:items-start'>
            <div className='flex items-center justify-center gap-3'>
              <div className='flex items-center'>
                <CourseroadIcon className='shrink-0' size={34} />
                <span className='ml-2 text-sm font-medium text-foreground'>Courseroad</span>
              </div>
              <Separator className='h-5 w-[2px] rounded-full bg-foreground/20' orientation='vertical' />
              <div className='flex items-center gap-2'>
                <StatusDot size={10} variant='success' />
                <span className='text-sm text-foreground/70'>All systems operational</span>
              </div>
            </div>
            <p className='text-center text-xs text-muted-foreground md:text-start'>
              &copy; {new Date().getFullYear()} Courseroad. All rights reserved.
            </p>
          </div>
          <div className='flex items-center justify-center'>
            <ThemeSwitch className='w-52' theme={theme} onThemeChange={setTheme} />
          </div>
        </div>
      </div>
    </footer>
  );
}
