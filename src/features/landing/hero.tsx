'use client';

import { Card } from '@courseroad/iota-ui';

import { SwissFlagIcon } from '@/assets/icons/swiss-flag-icon';

import { HeroButtons } from './hero-buttons';

/**
 * Hero section for the landing page.
 * Contains the main headline, description, and contextual buttons inside Iota's frosted-glass `Card`.
 */
export function Hero() {
  return (
    // The interactive background is mounted once in the `(public)` layout (see `LandingBackground`).
    <div className='relative z-20 flex flex-1 items-center justify-center px-6 py-10 sm:py-12 lg:px-8'>
      {/* Never fade this wrapper: opacity < 1 on an ancestor disables the Card's backdrop-filter, so the animation lives on the Card itself. */}
      <div className='mx-auto w-full max-w-3xl'>
        <Card
          className='animate-public-card-enter items-center gap-8 p-8 pt-10 text-center sm:p-12 sm:pt-14'
          shadow='xl'
          variant='frosted-glass'
        >
          <div className='flex items-center gap-2.5 rounded-full border border-border/80 bg-background/80 px-4 py-2 shadow-md ring-1 ring-border/20 backdrop-blur-md transition-all hover:bg-background hover:shadow-lg'>
            <SwissFlagIcon size={20} />
            <span className='text-sm font-semibold tracking-tight text-foreground'>Swiss Made Software</span>
          </div>

          <div className='flex flex-col gap-4'>
            <h1 className='bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl'>
              Courseroad
            </h1>
            <p className='text-lg font-medium text-muted-foreground sm:text-xl'>Learn, Manage, Succeed</p>
          </div>

          <HeroButtons />
        </Card>
      </div>
    </div>
  );
}
