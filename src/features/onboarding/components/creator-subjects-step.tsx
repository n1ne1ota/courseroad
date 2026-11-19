'use client';

import { Button } from '@courseroad/iota-ui';

import { Briefcase, Code, GraduationCap, Music, Palette, TrendingUp } from 'lucide-react';

interface SubjectTheme {
  activeBg: string;
  activeBorder: string;
  activeDescriptionColor: string;
  activeIconBg: string;
  activeTitleColor: string;
  glow: string;
  iconColor: string;
}

interface SubjectOption {
  desc: string;
  icon: typeof Code;
  id: string;
  label: string;
  theme: SubjectTheme;
}

export const SUBJECT_OPTIONS: SubjectOption[] = [
  {
    desc: 'Coding, web/mobile development, devops',
    icon: Code,
    id: 'tech',
    label: 'Technology & Code',
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
    desc: 'Management, product, startup advice',
    icon: Briefcase,
    id: 'business',
    label: 'Business & Startups',
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
    desc: 'Visual design, interface design, graphics',
    icon: Palette,
    id: 'design',
    label: 'Design & UI/UX',
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
    desc: 'SEO, digital marketing, conversion',
    icon: TrendingUp,
    id: 'marketing',
    label: 'Marketing & Growth',
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
    desc: 'Math, literature, physics, chemistry',
    icon: GraduationCap,
    id: 'academic',
    label: 'Academics & Science',
    theme: {
      activeBg: 'bg-indigo-500/10',
      activeBorder: 'border-indigo-500/80',
      activeDescriptionColor: 'text-indigo-400/70',
      activeIconBg: 'bg-indigo-500/20',
      activeTitleColor: 'text-indigo-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]',
      iconColor: 'text-indigo-500'
    }
  },
  {
    desc: 'Photography, music, video production',
    icon: Music,
    id: 'creative',
    label: 'Creative Arts',
    theme: {
      activeBg: 'bg-fuchsia-500/10',
      activeBorder: 'border-fuchsia-500/80',
      activeDescriptionColor: 'text-fuchsia-400/70',
      activeIconBg: 'bg-fuchsia-500/20',
      activeTitleColor: 'text-fuchsia-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(217,70,239,0.2)]',
      iconColor: 'text-fuchsia-500'
    }
  }
];

interface CreatorSubjectsStepProps {
  onBack: () => void;
  onContinue: () => void;
  selectedSubjects: string[];
  toggleSubject: (id: string) => void;
}

/**
 * CreatorSubjectsStep renders the second step of the creator onboarding flow.
 * Allows creators to select their subject areas.
 */
export function CreatorSubjectsStep({ selectedSubjects, toggleSubject, onBack, onContinue }: CreatorSubjectsStepProps) {
  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold tracking-tight'>Teaching Verticals</h2>
        <p className='mt-2 text-base text-muted-foreground'>Select the subjects you intend to publish courses on.</p>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        {SUBJECT_OPTIONS.map(opt => {
          const IconComponent = opt.icon;
          const isSelected = selectedSubjects.includes(opt.id);
          return (
            <button
              key={opt.id}
              className={`group flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-300 ${
                isSelected
                  ? `${opt.theme.activeBorder} ${opt.theme.activeBg} ${opt.theme.glow}`
                  : 'border-border bg-card/10 text-muted-foreground backdrop-blur-sm hover:border-muted-foreground/40 hover:bg-muted/20 hover:text-foreground'
              }`}
              type='button'
              onClick={() => toggleSubject(opt.id)}
            >
              <div
                className={`rounded-xl p-2.5 transition-all duration-300 ${
                  isSelected ? `${opt.theme.activeIconBg} shadow-inner` : 'bg-card/70 group-hover:bg-card/95'
                }`}
              >
                <IconComponent
                  className={`size-5 transition-colors duration-300 ${
                    isSelected ? opt.theme.iconColor : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
              </div>
              <span
                className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
                  isSelected ? opt.theme.activeTitleColor : 'text-foreground/80 group-hover:text-foreground'
                }`}
              >
                {opt.label}
              </span>
              <span
                className={`text-xs leading-normal transition-colors duration-300 ${
                  isSelected
                    ? opt.theme.activeDescriptionColor
                    : 'text-muted-foreground/80 group-hover:text-muted-foreground'
                }`}
              >
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>

      <div className='flex gap-2'>
        <Button className='flex-1 cursor-pointer' variant='secondary' onPress={onBack}>
          Back
        </Button>
        <Button className='flex-1 cursor-pointer' color='brand' onPress={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
