'use client';

import { usePathname } from 'next/navigation';

import { BackgroundPixelBlast } from '@courseroad/kurume-ui/animations';

import { useTheme } from 'next-themes';

import { COLORS } from '@/lib/constants/colors';
import { routes } from '@/lib/routes';

// Electric blue matches --brand (#0054ff); semantic primary is the neutral, so use brand explicitly.
const PIXEL_COLOR = COLORS.hex.brand;

// Routes that show the interactive background. Staying mounted while navigating between them keeps the
// same WebGL instance, so the pattern, shape and animation continue instead of being re-randomized.
const BACKGROUND_PATHS: ReadonlySet<string> = new Set([
  routes.home,
  routes.courses,
  routes.blog,
  routes.changelog,
  routes.pricing,
  routes.about,
  routes.contact
]);

function hasLandingBackground(pathname: string | null): boolean {
  if (!pathname) return false;
  if (BACKGROUND_PATHS.has(pathname)) return true;
  if (pathname.startsWith(`${routes.blog}/`) || pathname.startsWith('/unsubscribe/')) return true;

  // Enable on /courses/[courseId] while leaving checkout and success routes untouched.
  if (pathname.startsWith(`${routes.courses}/`)) {
    return !pathname.endsWith('/checkout') && !pathname.endsWith('/success');
  }

  return false;
}

const pixelBlastConfig = {
  darkModeColor: PIXEL_COLOR,
  edgeFade: 0.5,
  lightModeColor: PIXEL_COLOR,
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
 * Interactive pixel background shared by the public pages. Mount it once in the `(public)` layout: layouts
 * persist across navigation, so the field survives client-side transitions across public routes.
 */
export function LandingBackground() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  if (!hasLandingBackground(pathname)) return null;

  return (
    <div className='fixed inset-0 z-0' aria-hidden>
      <BackgroundPixelBlast
        enableRipples
        pauseWhenHidden
        transparent
        useThemeColors
        theme={resolvedTheme}
        variant='square'
        {...pixelBlastConfig}
      />
    </div>
  );
}
