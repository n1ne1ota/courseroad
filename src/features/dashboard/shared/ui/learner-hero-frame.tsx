import type { JSX, ReactNode } from 'react';

import { Sparkles } from 'lucide-react';

import { heroPanelClass } from './dashboard-surfaces';

type LearnerHeroFrameProps = {
  /** Optional trailing content beside the greeting (e.g. the "Resume" link). */
  aside?: ReactNode;
  children: ReactNode;
};

/** Static hero chrome (panel, glow, badge) shared by the learner heroes and their skeletons. */
export function LearnerHeroFrame({ aside, children }: LearnerHeroFrameProps): JSX.Element {
  return (
    <div className={heroPanelClass}>
      <div className='pointer-events-none absolute -top-20 -right-20 size-[300px] rounded-full bg-secondary/10 blur-[80px]' />

      <div className='slide-in-bottom-1 z-10'>
        <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 backdrop-blur-md'>
          <Sparkles className='size-4 text-brand' />
          <span className='text-xs font-semibold tracking-wider text-brand uppercase'>Learner Portal</span>
        </div>
        {children}
      </div>

      {aside}
    </div>
  );
}
