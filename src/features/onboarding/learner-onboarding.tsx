'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { Card, Spinner, StepperBasic } from '@courseroad/iota-ui';
import { AnimatePresence, motion } from 'motion/react';

import { completeOnboarding } from '@/features/onboarding/actions';

import { LearnerGoalStep } from './learner-goal-step';
import { LearnerInterestsStep } from './learner-interests-step';
import { LearnerProfileStep } from './learner-profile-step';

type LearnerStep = 'profile' | 'interests' | 'goal' | 'creating';

interface LearnerOnboardingFlowProps {
  user: {
    bio: string;
    email: string;
    firstName: string;
    image?: string;
    lastName: string;
    name: string;
    username?: string;
  };
}

const STEP_ORDER: LearnerStep[] = ['profile', 'interests', 'goal', 'creating'];
const ONBOARDING_STEPS = [{ title: 'Profile Setup' }, { title: 'Interests' }, { title: 'Study Goal' }];

const SLIDE_VARIANTS = {
  center: {
    opacity: 1,
    x: 0
  },
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40
  }),
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -40 : 40
  })
};

/**
 * LearnerOnboardingFlow orchestrates the B2C learner onboarding wizard.
 * It manages form states, step history, and triggers user onboarding completion.
 */
export function LearnerOnboardingFlow({ user }: LearnerOnboardingFlowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<LearnerStep>('profile');
  const [direction, setDirection] = useState(1);
  const [firstName, setFirstName] = useState(user.firstName || user.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user.lastName || user.name.split(' ').slice(1).join(' ') || '');
  const [username, setUsername] = useState(user.username || '');
  const [image, setImage] = useState<string | null>(user.image || null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>('regular');
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEP_ORDER.indexOf(step);

  function goToStep(target: LearnerStep) {
    const targetIndex = STEP_ORDER.indexOf(target);
    setDirection(targetIndex > stepIndex ? 1 : -1);
    setError(null);
    setStep(target);
  }

  function handleProfileSubmit() {
    if (!firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!lastName.trim()) {
      setError('Last name is required.');
      return;
    }
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Username is required.');
      return;
    }
    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      setError('Username can only contain alphanumeric characters, underscores, and hyphens.');
      return;
    }
    goToStep('interests');
  }

  function toggleInterest(id: string) {
    setSelectedInterests(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  function handleComplete() {
    goToStep('creating');
    setError(null);

    startTransition(async () => {
      const result = await completeOnboarding({
        role: 'learner',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        image: image || undefined
      });

      if (result?.error) {
        setError(result.error);
        goToStep('goal');
        return;
      }

      router.push('/learner/dashboard' as Route);
    });
  }

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' && event.key !== 'Enter') return;

      if (event.key === 'Enter') {
        event.preventDefault();
        if (step === 'profile') handleProfileSubmit();
        else if (step === 'interests') goToStep('goal');
        else if (step === 'goal') handleComplete();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        if (step === 'interests') goToStep('profile');
        else if (step === 'goal') goToStep('interests');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, firstName, lastName, username, image, selectedInterests, selectedGoal, isPending]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <motion.div
      className='w-full max-w-md'
      animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      initial={{ filter: 'blur(4px)', opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className='flex w-full flex-col gap-4 overflow-hidden p-8'>
        {step !== 'creating' && (
          <div className='-mx-4'>
            <StepperBasic
              currentStep={stepIndex}
              steps={ONBOARDING_STEPS}
              onStepChange={index => {
                const targetStep = STEP_ORDER[index];
                if (index < stepIndex) {
                  if (targetStep) goToStep(targetStep);
                } else if (
                  index === 1 &&
                  step === 'profile' &&
                  firstName.trim() &&
                  lastName.trim() &&
                  username.trim()
                ) {
                  goToStep('interests');
                } else if (index === 2 && step === 'interests') {
                  goToStep('goal');
                }
              }}
            />
          </div>
        )}

        <AnimatePresence custom={direction} initial={false} mode='wait'>
          {step === 'profile' && (
            <motion.div
              key='profile'
              className='mt-10'
              animate='center'
              custom={direction}
              exit='exit'
              initial='enter'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              variants={SLIDE_VARIANTS}
            >
              <LearnerProfileStep
                error={error}
                firstName={firstName}
                image={image}
                lastName={lastName}
                setFirstName={setFirstName}
                setImage={setImage}
                setLastName={setLastName}
                setUsername={setUsername}
                username={username}
                onContinue={handleProfileSubmit}
              />
            </motion.div>
          )}

          {step === 'interests' && (
            <motion.div
              key='interests'
              className='mt-10'
              animate='center'
              custom={direction}
              exit='exit'
              initial='enter'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              variants={SLIDE_VARIANTS}
            >
              <LearnerInterestsStep
                selectedInterests={selectedInterests}
                toggleInterest={toggleInterest}
                onBack={() => goToStep('profile')}
                onContinue={() => goToStep('goal')}
              />
            </motion.div>
          )}

          {step === 'goal' && (
            <motion.div
              key='goal'
              className='mt-10'
              animate='center'
              custom={direction}
              exit='exit'
              initial='enter'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              variants={SLIDE_VARIANTS}
            >
              <LearnerGoalStep
                error={error}
                isPending={isPending}
                selectedGoal={selectedGoal}
                setSelectedGoal={setSelectedGoal}
                onBack={() => goToStep('interests')}
                onComplete={handleComplete}
              />
            </motion.div>
          )}

          {step === 'creating' && (
            <motion.div
              key='creating'
              className='mt-10 flex flex-col items-center gap-4 py-8'
              animate='center'
              custom={direction}
              exit='exit'
              initial='enter'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              variants={SLIDE_VARIANTS}
            >
              <Spinner color='primary' size='lg' />
              <div className='text-center'>
                <h2 className='text-lg font-bold'>Setting up your student dashboard...</h2>
                <p className='mt-1 text-sm text-muted-foreground'>This will only take a moment.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
