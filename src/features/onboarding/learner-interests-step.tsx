'use client';

import { Briefcase, Code, Cpu, GraduationCap, Palette, Sparkles } from 'lucide-react';

import { Button } from '@courseroad/iota-ui';

interface InterestTheme {
  activeBg: string;
  activeBorder: string;
  activeDescriptionColor: string;
  activeIconBg: string;
  activeTitleColor: string;
  glow: string;
  iconColor: string;
}

interface InterestOption {
  desc: string;
  icon: typeof Code;
  id: string;
  label: string;
  theme: InterestTheme;
}

export const INTEREST_OPTIONS: InterestOption[] = [
  {
    desc: 'Coding, web/mobile development, algorithms',
    icon: Code,
    id: 'dev',
    label: 'Software Development',
    theme: {
      activeBg: 'bg-purple-500/10',
      activeBorder: 'border-purple-500/80',
      activeDescriptionColor: 'text-purple-400/70',
      activeIconBg: 'bg-purple-500/20',
      activeTitleColor: 'text-purple-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]',
      iconColor: 'text-purple-500'
    }
  },
  {
    desc: 'Machine learning, analytics, database',
    icon: Cpu,
    id: 'data',
    label: 'Data Science & AI',
    theme: {
      activeBg: 'bg-blue-500/10',
      activeBorder: 'border-blue-500/80',
      activeDescriptionColor: 'text-blue-400/70',
      activeIconBg: 'bg-blue-500/20',
      activeTitleColor: 'text-blue-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]',
      iconColor: 'text-blue-500'
    }
  },
  {
    desc: 'UI/UX design, graphics, branding',
    icon: Palette,
    id: 'design',
    label: 'Design & Creative',
    theme: {
      activeBg: 'bg-pink-500/10',
      activeBorder: 'border-pink-500/80',
      activeDescriptionColor: 'text-pink-400/70',
      activeIconBg: 'bg-pink-500/20',
      activeTitleColor: 'text-pink-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(236,72,153,0.2)]',
      iconColor: 'text-pink-500'
    }
  },
  {
    desc: 'Product, marketing, finance',
    icon: Briefcase,
    id: 'business',
    label: 'Business & Marketing',
    theme: {
      activeBg: 'bg-amber-500/10',
      activeBorder: 'border-amber-500/80',
      activeDescriptionColor: 'text-amber-400/70',
      activeIconBg: 'bg-amber-500/20',
      activeTitleColor: 'text-amber-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]',
      iconColor: 'text-amber-500'
    }
  },
  {
    desc: 'Languages, productivity, writing',
    icon: Sparkles,
    id: 'growth',
    label: 'Hobby & Growth',
    theme: {
      activeBg: 'bg-emerald-500/10',
      activeBorder: 'border-emerald-500/80',
      activeDescriptionColor: 'text-emerald-400/70',
      activeIconBg: 'bg-emerald-500/20',
      activeTitleColor: 'text-emerald-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]',
      iconColor: 'text-emerald-500'
    }
  },
  {
    desc: 'Math, science, history',
    icon: GraduationCap,
    id: 'academic',
    label: 'Academic Studies',
    theme: {
      activeBg: 'bg-indigo-500/10',
      activeBorder: 'border-indigo-500/80',
      activeDescriptionColor: 'text-indigo-400/70',
      activeIconBg: 'bg-indigo-500/20',
      activeTitleColor: 'text-indigo-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]',
      iconColor: 'text-indigo-500'
    }
  }
];

interface LearnerInterestsStepProps {
  onBack: () => void;
  onContinue: () => void;
  selectedInterests: string[];
  toggleInterest: (id: string) => void;
}

/**
 * LearnerInterestsStep renders the second step of the learner onboarding flow.
 * Allows learners to select their topics/subjects of interest.
 */
export function LearnerInterestsStep({
  selectedInterests,
  toggleInterest,
  onBack,
  onContinue
}: LearnerInterestsStepProps) {
  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold tracking-tight'>Learning Interests</h2>
        <p className='mt-2 text-base text-muted-foreground'>
          Select the subjects you are interested in. This helps us customize your home feed.
        </p>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        {INTEREST_OPTIONS.map(opt => {
          const IconComponent = opt.icon;
          const isSelected = selectedInterests.includes(opt.id);
          return (
            <button
              key={opt.id}
              className={`group flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-300 ${
                isSelected
                  ? `${opt.theme.activeBorder} ${opt.theme.activeBg} ${opt.theme.glow}`
                  : 'border-zinc-800 bg-zinc-900/10 text-zinc-400 backdrop-blur-sm hover:border-zinc-700 hover:bg-zinc-800/20 hover:text-zinc-100'
              }`}
              type='button'
              onClick={() => toggleInterest(opt.id)}
            >
              <div
                className={`rounded-xl p-2.5 transition-all duration-300 ${
                  isSelected ? `${opt.theme.activeIconBg} shadow-inner` : 'bg-zinc-900/70 group-hover:bg-zinc-900/95'
                }`}
              >
                <IconComponent
                  className={`size-5 transition-colors duration-300 ${
                    isSelected ? opt.theme.iconColor : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />
              </div>
              <span
                className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
                  isSelected ? opt.theme.activeTitleColor : 'text-zinc-300 group-hover:text-zinc-100'
                }`}
              >
                {opt.label}
              </span>
              <span
                className={`text-xs leading-normal transition-colors duration-300 ${
                  isSelected ? opt.theme.activeDescriptionColor : 'text-zinc-500 group-hover:text-zinc-400'
                }`}
              >
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>

      <div className='flex gap-2'>
        <Button className='flex-1 cursor-pointer' color='secondary' onPress={onBack}>
          Back
        </Button>
        <Button className='flex-1 cursor-pointer' color='primary' onPress={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
