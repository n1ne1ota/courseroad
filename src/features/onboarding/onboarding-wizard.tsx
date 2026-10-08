'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { Building2, GraduationCap, Sparkles } from 'lucide-react';
import { motion, type Variants } from 'motion/react';

import { Card } from '@courseroad/iota-ui';

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
    filter: 'blur(4px)'
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
      delayChildren: 0.15,
      staggerChildren: 0.1
    }
  }
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -16,
    y: 8
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const
    }
  }
};

interface OnboardingWizardProps {
  userName: string;
}

/**
 * Onboarding path selection component.
 * Allows users to choose between Learner, Creator, and B2B Organization routes.
 *
 * Displays choices as 3 columns in a grid using 1:1 visual styling parity with the Use Case cards.
 */
export function OnboardingWizard({ userName }: OnboardingWizardProps) {
  const router = useRouter();

  return (
    <motion.div className='w-full max-w-3xl' animate='visible' initial='hidden' variants={containerVariants}>
      <Card className='flex w-full flex-col gap-6 overflow-hidden p-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-extrabold tracking-tight'>Welcome, {userName}!</h1>
          <p className='mt-2 text-sm text-muted-foreground'>Choose how you want to experience Courseroad:</p>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {/* B2C Learner Path */}
          <motion.button
            className='group flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 text-center text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:border-primary/80 hover:bg-primary/10 hover:text-zinc-100 hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]'
            type='button'
            variants={cardVariants}
            onClick={() => router.push('/onboarding/learner' as Route)}
          >
            <div className='rounded-xl bg-zinc-900/70 p-2.5 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-inner'>
              <GraduationCap className='size-5 text-zinc-500 transition-colors duration-300 group-hover:text-primary' />
            </div>
            <span className='text-lg font-bold tracking-tight text-zinc-300 transition-colors duration-300 group-hover:text-primary'>
              Learner
            </span>
            <span className='text-sm leading-normal text-zinc-500 transition-colors duration-300 group-hover:text-primary/70'>
              Learn at your own pace, track certificates, and buy directly from our marketplace.
            </span>
          </motion.button>

          {/* B2C Creator Path */}
          <motion.button
            className='group flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 text-center text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:border-primary/80 hover:bg-primary/10 hover:text-zinc-100 hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]'
            type='button'
            variants={cardVariants}
            onClick={() => router.push('/onboarding/creator' as Route)}
          >
            <div className='rounded-xl bg-zinc-900/70 p-2.5 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-inner'>
              <Sparkles className='size-5 text-zinc-500 transition-colors duration-300 group-hover:text-primary' />
            </div>
            <span className='text-lg font-bold tracking-tight text-zinc-300 transition-colors duration-300 group-hover:text-primary'>
              Creator
            </span>
            <span className='text-sm leading-normal text-zinc-500 transition-colors duration-300 group-hover:text-primary/70'>
              Publish your own courses, build your personal brand, and earn from your knowledge.
            </span>
          </motion.button>

          {/* B2B Organization Path */}
          <motion.button
            className='group flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 text-center text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:border-primary/80 hover:bg-primary/10 hover:text-zinc-100 hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]'
            type='button'
            variants={cardVariants}
            onClick={() => router.push('/onboarding/organization' as Route)}
          >
            <div className='rounded-xl bg-zinc-900/70 p-2.5 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-inner'>
              <Building2 className='size-5 text-zinc-500 transition-colors duration-300 group-hover:text-primary' />
            </div>
            <span className='text-lg font-bold tracking-tight text-zinc-300 transition-colors duration-300 group-hover:text-primary'>
              Organization
            </span>
            <span className='text-sm leading-normal text-zinc-500 transition-colors duration-300 group-hover:text-primary/70'>
              Host courses for your team or learners, organize cohorts, and manage members.
            </span>
          </motion.button>
        </div>
      </Card>
    </motion.div>
  );
}
