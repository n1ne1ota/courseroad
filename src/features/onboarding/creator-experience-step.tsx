'use client';

import { Button, Radio, RadioGroup, Spinner } from '@courseroad/iota-ui';
import { Alert, AlertDescription } from '@courseroad/kurume-ui';

interface BackgroundOption {
  desc: string;
  id: string;
  label: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: 'professional',
    label: 'Professional Educator',
    desc: 'I teach full-time at an academic institution or bootcamp'
  },
  {
    id: 'experienced',
    label: 'Experienced Creator',
    desc: 'I publish online tutorials, blogs, or course content part-time'
  },
  { id: 'new', label: 'New Creator', desc: 'I am new to creating courses and want to publish my first course' }
];

interface CreatorExperienceStepProps {
  error: string | null;
  isPending: boolean;
  onBack: () => void;
  onComplete: () => void;
  selectedBackground: string;
  setSelectedBackground: (id: string) => void;
}

/**
 * CreatorExperienceStep renders the final selection step of the creator onboarding flow.
 * Allows creators to choose their teaching background experience level, and finishes onboarding.
 */
export function CreatorExperienceStep({
  selectedBackground,
  setSelectedBackground,
  onBack,
  onComplete,
  isPending,
  error
}: CreatorExperienceStepProps) {
  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold tracking-tight'>Teaching Background</h2>
        <p className='mt-2 text-base text-muted-foreground'>Tell us a bit about your experience as a teacher.</p>
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <RadioGroup
        classNames={{
          wrapper: 'flex flex-col gap-3'
        }}
        value={selectedBackground}
        onValueChange={val => setSelectedBackground(val as string)}
      >
        {BACKGROUND_OPTIONS.map(opt => {
          const isSelected = selectedBackground === opt.id;
          return (
            <Radio
              key={opt.id}
              classNames={{
                base: `group flex !w-full !max-w-full cursor-pointer !items-center gap-4 rounded-2xl border !p-4 text-left transition-all duration-300 !m-0 ${
                  isSelected
                    ? 'border-primary/80 bg-primary/10 shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]'
                    : 'border-zinc-800 bg-zinc-900/10 text-zinc-400 backdrop-blur-sm hover:border-zinc-700 hover:bg-zinc-800/20 hover:text-zinc-100'
                }`,
                wrapper: 'shrink-0 !mr-0',
                label: `block text-sm font-bold tracking-tight transition-colors duration-300 ${
                  isSelected ? 'text-primary' : 'text-zinc-300 group-hover:text-zinc-100'
                }`,
                description: `mt-1 block text-xs leading-normal transition-colors duration-300 ${
                  isSelected ? 'text-primary/70' : 'text-zinc-500 group-hover:text-zinc-400'
                }`,
                labelWrapper: 'ml-0'
              }}
              description={opt.desc}
              value={opt.id}
            >
              {opt.label}
            </Radio>
          );
        })}
      </RadioGroup>

      <div className='flex gap-2'>
        <Button className='flex-1 cursor-pointer' color='secondary' onPress={onBack}>
          Back
        </Button>
        <Button
          className='flex-1 cursor-pointer'
          color='primary'
          isLoading={isPending}
          spinner={<Spinner color='current' size='sm' />}
          onPress={onComplete}
        >
          Finish
        </Button>
      </div>
    </div>
  );
}
