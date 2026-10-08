'use client';

import { BookOpen, Code, Gamepad2, GraduationCap, MoreHorizontal, Store } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@courseroad/iota-ui';

import type { Intent } from '@/features/onboarding/schemas';

interface IntentTheme {
  activeBg: string;
  activeBorder: string;
  activeDescriptionColor: string;
  activeIconBg: string;
  activeTitleColor: string;
  glow: string;
  iconColor: string;
}

interface IntentOption {
  description: string;
  icon: typeof Store;
  label: string;
  theme: IntentTheme;
  value: Intent;
}

const INTENT_OPTIONS: IntentOption[] = [
  {
    description: 'Monetize your knowledge',
    icon: Store,
    label: 'Selling Courses',
    theme: {
      activeBg: 'bg-amber-500/10',
      activeBorder: 'border-amber-500/80',
      activeDescriptionColor: 'text-amber-400/70',
      activeIconBg: 'bg-amber-500/20',
      activeTitleColor: 'text-amber-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]',
      iconColor: 'text-amber-500'
    },
    value: 'selling-courses'
  },
  {
    description: 'Train your team internally',
    icon: BookOpen,
    label: 'Internal Training',
    theme: {
      activeBg: 'bg-blue-500/10',
      activeBorder: 'border-blue-500/80',
      activeDescriptionColor: 'text-blue-400/70',
      activeIconBg: 'bg-blue-500/20',
      activeTitleColor: 'text-blue-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]',
      iconColor: 'text-blue-500'
    },
    value: 'internal-training'
  },
  {
    description: 'Run a coding bootcamp',
    icon: Code,
    label: 'Bootcamp',
    theme: {
      activeBg: 'bg-purple-500/10',
      activeBorder: 'border-purple-500/80',
      activeDescriptionColor: 'text-purple-400/70',
      activeIconBg: 'bg-purple-500/20',
      activeTitleColor: 'text-purple-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]',
      iconColor: 'text-purple-500'
    },
    value: 'bootcamp'
  },
  {
    description: 'Learn and experiment',
    icon: Gamepad2,
    label: 'Hobby',
    theme: {
      activeBg: 'bg-emerald-500/10',
      activeBorder: 'border-emerald-500/80',
      activeDescriptionColor: 'text-emerald-400/70',
      activeIconBg: 'bg-emerald-500/20',
      activeTitleColor: 'text-emerald-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]',
      iconColor: 'text-emerald-500'
    },
    value: 'hobby'
  },
  {
    description: 'Academic class & school',
    icon: GraduationCap,
    label: 'Academic',
    theme: {
      activeBg: 'bg-indigo-500/10',
      activeBorder: 'border-indigo-500/80',
      activeDescriptionColor: 'text-indigo-400/70',
      activeIconBg: 'bg-indigo-500/20',
      activeTitleColor: 'text-indigo-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]',
      iconColor: 'text-indigo-500'
    },
    value: 'academic'
  },
  {
    description: 'Something else entirely',
    icon: MoreHorizontal,
    label: 'Other',
    theme: {
      activeBg: 'bg-fuchsia-500/10',
      activeBorder: 'border-fuchsia-500/80',
      activeDescriptionColor: 'text-fuchsia-400/70',
      activeIconBg: 'bg-fuchsia-500/20',
      activeTitleColor: 'text-fuchsia-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(217,70,239,0.2)]',
      iconColor: 'text-fuchsia-500'
    },
    value: 'other'
  }
];

const SUB_INTENT_OPTIONS = [
  { label: 'Customer Onboarding & Education', value: 'customer-education' },
  { label: 'Non-profit / NGO Training', value: 'non-profit' },
  { label: 'Content Creator & Community', value: 'content-creator' },
  { label: 'New Employee Onboarding', value: 'employee-onboarding' },
  { label: 'Compliance & Regulatory Training', value: 'compliance' },
  { label: 'Coaching & Consulting Services', value: 'coaching' },
  { label: 'Professional Certification Programs', value: 'certification' },
  { label: 'Something else entirely', value: 'other-custom' }
] as const;

interface IntentSelectorProps {
  onSelect: (intent: Intent | null) => void;
  selected: Intent | null;
}

export function IntentSelector({ onSelect, selected }: IntentSelectorProps) {
  const isOtherSelected = selected === 'other' || SUB_INTENT_OPTIONS.some(opt => opt.value === selected);

  const handleSelectSubIntent = (val: string | null) => {
    if (val) {
      onSelect(val as Intent);
    }
  };

  const getSubIntentValue = () => {
    if (selected && SUB_INTENT_OPTIONS.some(o => o.value === selected)) {
      return selected;
    }
    return 'other-custom';
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='grid grid-cols-2 gap-3'>
        {INTENT_OPTIONS.map(option => {
          const isSelected = option.value === 'other' ? isOtherSelected : selected === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              className={`group flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-300 ${
                isSelected
                  ? `${option.theme.activeBorder} ${option.theme.activeBg} ${option.theme.glow}`
                  : 'border-zinc-800 bg-zinc-900/10 text-zinc-400 backdrop-blur-sm hover:border-zinc-700 hover:bg-zinc-800/20 hover:text-zinc-100'
              }`}
              type='button'
              onClick={() => {
                if (option.value === 'other') {
                  onSelect(isOtherSelected ? null : 'other');
                } else {
                  onSelect(isSelected ? null : option.value);
                }
              }}
            >
              <div
                className={`rounded-xl p-2.5 transition-all duration-300 ${
                  isSelected ? `${option.theme.activeIconBg} shadow-inner` : 'bg-zinc-900/70 group-hover:bg-zinc-900/95'
                }`}
              >
                <Icon
                  className={`size-5 transition-colors duration-300 ${
                    isSelected ? option.theme.iconColor : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />
              </div>
              <span
                className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
                  isSelected ? option.theme.activeTitleColor : 'text-zinc-300 group-hover:text-zinc-100'
                }`}
              >
                {option.label}
              </span>
              <span
                className={`text-xs leading-normal transition-colors duration-300 ${
                  isSelected ? option.theme.activeDescriptionColor : 'text-zinc-500 group-hover:text-zinc-400'
                }`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {isOtherSelected && (
          <motion.div
            className='overflow-hidden'
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className='px-0.5 py-1'>
              <Select
                color='primary'
                label='Specify Use Case'
                value={getSubIntentValue()}
                variant='bordered'
                onValueChange={handleSelectSubIntent}
              >
                <SelectTrigger placeholder='Choose a specific use case...' />
                <SelectContent>
                  {SUB_INTENT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
