'use client';

import { useTheme } from 'next-themes';

import { useInView } from '@/hooks/use-in-view';
import { COLORS } from '@/lib/constants/colors';

import { SwissFlagIcon } from '@/assets/icons/swiss-flag-icon';
import { BackgroundPixelBlast } from '@courseroad/kurume-ui/animations';

import { HeroButtons } from './hero-buttons';

// PixelBlast color tokens
// Electric blue matches --primary-500 (#0054ff)
const PIXEL_COLOR_DARK = COLORS.primary;
const PIXEL_COLOR_LIGHT = COLORS.primary;

// PixelBlast animation config
const pixelBlastConfig = {
  darkModeColor: PIXEL_COLOR_DARK,
  edgeFade: 0.5,
  lightModeColor: PIXEL_COLOR_LIGHT,
  maxFPS: 24,
  patternDensity: 1.5,
  patternScale: 3,
  pixelSize: 4,
  pixelSizeJitter: 0,
  resolutionScale: 0.5,
  rippleIntensityScale: 1.5,
  rippleSpeed: 0.5,
  rippleThickness: 0.1,
  speed: 0.5
} as const;

/**
 * Hero section for the landing page
 * Contains the main headline, description, and contextual buttons
 * Shows Dashboard/Account button for logged-in users, Sign In/Sign Up for guests
 */
export function Hero() {
  const { theme } = useTheme();
  const { inView, ref } = useInView({ once: true, threshold: 0.1 });

  return (
    <>
      {/* Interactive background behind all UI */}
      <div className='fixed inset-0 z-0'>
        <BackgroundPixelBlast
          enableRipples
          pauseWhenHidden
          transparent
          useThemeColors
          theme={theme}
          variant='square'
          {...pixelBlastConfig}
        />
      </div>

      {/* Hero content */}
      <div className='relative z-20 flex flex-1 items-center justify-center px-4 sm:px-6'>
        <div
          ref={ref}
          className='mx-auto flex w-full max-w-3xl flex-col items-center gap-8 rounded-3xl border border-white/10 bg-background/10 p-8 pt-10 text-center shadow-2xl backdrop-blur-sm transition-all duration-1000 ease-out data-[in-view=false]:translate-y-8 data-[in-view=false]:opacity-0 data-[in-view=true]:translate-y-0 data-[in-view=true]:opacity-100 sm:p-12 sm:pt-14 dark:border-white/5'
          data-in-view={inView}
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
        </div>
      </div>
    </>
  );
}
