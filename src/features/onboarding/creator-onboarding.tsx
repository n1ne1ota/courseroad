'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { Card, Spinner, StepperBasic } from '@courseroad/iota-ui';
import { AnimatePresence, motion } from 'motion/react';

import { completeOnboarding } from '@/features/onboarding/actions';

import { CreatorExperienceStep } from './creator-experience-step';
import { CreatorProfileStep } from './creator-profile-step';
import { CreatorSubjectsStep } from './creator-subjects-step';

type CreatorStep = 'profile' | 'subjects' | 'experience' | 'creating';

interface CreatorOnboardingFlowProps {
  user: {
    bio: string;
    email: string;
    firstName: string;
    githubUrl?: string;
    image?: string;
    lastName: string;
    name: string;
    twitterUrl?: string;
    username?: string;
    websiteUrl: string;
  };
}

const STEP_ORDER: CreatorStep[] = ['profile', 'subjects', 'experience', 'creating'];
const ONBOARDING_STEPS = [{ title: 'Profile Setup' }, { title: 'Teaching Area' }, { title: 'Experience' }];

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
 * CreatorOnboardingFlow orchestrates the B2C teacher/creator onboarding wizard.
 * It manages form states, step history, and triggers user onboarding completion.
 */
export function CreatorOnboardingFlow({ user }: CreatorOnboardingFlowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<CreatorStep>('profile');
  const [direction, setDirection] = useState(1);
  const [firstName, setFirstName] = useState(user.firstName || user.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user.lastName || user.name.split(' ').slice(1).join(' ') || '');
  const [username, setUsername] = useState(user.username || '');
  const [image, setImage] = useState<string | null>(user.image || null);
  const [websiteUrl, setWebsiteUrl] = useState(user.websiteUrl || '');
  const [twitterUrl, setTwitterUrl] = useState(user.twitterUrl || '');
  const [githubUrl, setGithubUrl] = useState(user.githubUrl || '');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<string>('experienced');
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEP_ORDER.indexOf(step);

  function goToStep(target: CreatorStep) {
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
    goToStep('subjects');
  }

  function toggleSubject(id: string) {
    setSelectedSubjects(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  function handleComplete() {
    goToStep('creating');
    setError(null);

    startTransition(async () => {
      const result = await completeOnboarding({
        role: 'creator',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        image: image || undefined,
        websiteUrl: websiteUrl.trim(),
        twitterUrl: twitterUrl.trim(),
        githubUrl: githubUrl.trim()
      });

      if (result?.error) {
        setError(result.error);
        goToStep('experience');
        return;
      }

      router.push('/creator/dashboard' as Route);
    });
  }

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' && event.key !== 'Enter') return;

      if (event.key === 'Enter') {
        event.preventDefault();
        if (step === 'profile') handleProfileSubmit();
        else if (step === 'subjects') goToStep('experience');
        else if (step === 'experience') handleComplete();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        if (step === 'subjects') goToStep('profile');
        else if (step === 'experience') goToStep('subjects');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      step,
      firstName,
      lastName,
      username,
      image,
      websiteUrl,
      twitterUrl,
      githubUrl,
      selectedSubjects,
      selectedBackground,
      isPending
    ]
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
                  goToStep('subjects');
                } else if (index === 2 && step === 'subjects') {
                  goToStep('experience');
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
              <CreatorProfileStep
                error={error}
                firstName={firstName}
                githubUrl={githubUrl}
                image={image}
                lastName={lastName}
                setFirstName={setFirstName}
                setGithubUrl={setGithubUrl}
                setImage={setImage}
                setLastName={setLastName}
                setTwitterUrl={setTwitterUrl}
                setUsername={setUsername}
                setWebsiteUrl={setWebsiteUrl}
                twitterUrl={twitterUrl}
                username={username}
                websiteUrl={websiteUrl}
                onContinue={handleProfileSubmit}
              />
            </motion.div>
          )}

          {step === 'subjects' && (
            <motion.div
              key='subjects'
              className='mt-10'
              animate='center'
              custom={direction}
              exit='exit'
              initial='enter'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              variants={SLIDE_VARIANTS}
            >
              <CreatorSubjectsStep
                selectedSubjects={selectedSubjects}
                toggleSubject={toggleSubject}
                onBack={() => goToStep('profile')}
                onContinue={() => goToStep('experience')}
              />
            </motion.div>
          )}

          {step === 'experience' && (
            <motion.div
              key='experience'
              className='mt-10'
              animate='center'
              custom={direction}
              exit='exit'
              initial='enter'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              variants={SLIDE_VARIANTS}
            >
              <CreatorExperienceStep
                error={error}
                isPending={isPending}
                selectedBackground={selectedBackground}
                setSelectedBackground={setSelectedBackground}
                onBack={() => goToStep('subjects')}
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
                <h2 className='text-lg font-bold'>Setting up your teacher dashboard...</h2>
                <p className='mt-1 text-sm text-muted-foreground'>This will only take a moment.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
