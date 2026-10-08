'use client';

import { Button, Radio, RadioGroup, Spinner } from '@courseroad/iota-ui';
import { Alert, AlertDescription } from '@courseroad/kurume-ui';

interface GoalOption {
  desc: string;
  id: string;
  label: string;
}

export const GOAL_OPTIONS: GoalOption[] = [
  { id: 'casual', label: 'Casual', desc: '1 hour per week' },
  { id: 'regular', label: 'Regular', desc: '3 hours per week' },
  { id: 'dedicated', label: 'Dedicated', desc: '5+ hours per week' }
];

interface LearnerGoalStepProps {
  error: string | null;
  isPending: boolean;
  onBack: () => void;
  onComplete: () => void;
  selectedGoal: string;
  setSelectedGoal: (id: string) => void;
}

/**
 * LearnerGoalStep renders the final selection step of the learner onboarding flow.
 * Allows learners to choose their weekly goal/commitment, and finishes the onboarding.
 */
export function LearnerGoalStep({
  selectedGoal,
  setSelectedGoal,
  onBack,
  onComplete,
  isPending,
  error
}: LearnerGoalStepProps) {
  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold tracking-tight'>Study Goal</h2>
        <p className='mt-2 text-base text-muted-foreground'>
          Pick a weekly study commitment to help keep yourself accountable.
        </p>
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
        value={selectedGoal}
        onValueChange={val => setSelectedGoal(val as string)}
      >
        {GOAL_OPTIONS.map(opt => {
          const isSelected = selectedGoal === opt.id;
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
