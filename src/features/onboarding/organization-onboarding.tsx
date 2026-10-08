'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { Button, Card, Input, InputURL, Spinner, StepperBasic, Tooltip } from '@courseroad/iota-ui';
import { Alert, AlertDescription } from '@courseroad/kurume-ui';
import { QuestionCircleLinear as QuestionCircleIcon } from '@solar-icons/react-perf';
import { AnimatePresence, motion } from 'motion/react';

import { authClient } from '@/lib/auth/auth-client';

import { completeOnboarding } from '@/features/onboarding/actions';
import { type Intent, onboardingEmailSchema, workspaceDetailsSchema } from '@/features/onboarding/schemas';

import { InviteTeam } from './organization-invite-team';
import { IntentSelector } from './organization-use-case';

type OrganizationStep = 'organization' | 'use-case' | 'invite' | 'creating';

// Generates a URL-safe slug from a display name during active typing.
function toSlugLive(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '');
}

const STEP_ORDER: OrganizationStep[] = ['organization', 'use-case', 'invite', 'creating'];
const ONBOARDING_STEPS = [{ title: 'Details' }, { title: 'Use Case' }, { title: 'Invite Team' }];

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
 * Onboarding wizard flow for B2B organization/academy creation.
 * Guided steps: Organization Details -> Use Case (Intent) -> Invite Team -> Create
 */
export function OrganizationOnboardingFlow() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<OrganizationStep>('organization');
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEP_ORDER.indexOf(step);

  function goToStep(target: OrganizationStep) {
    const targetIndex = STEP_ORDER.indexOf(target);
    setDirection(targetIndex > stepIndex ? 1 : -1);
    setError(null);
    setStep(target);
  }

  function handleNameChange(value: string) {
    setName(value);

    if (!slugEdited) setSlug(toSlugLive(value));
  }

  function handleSlugChange(value: string) {
    const processed = toSlugLive(value);
    setSlug(processed);
    if (processed === '') {
      setSlugEdited(false);
      setSlug(toSlugLive(name));
    } else {
      setSlugEdited(true);
    }
  }

  const handleSlugBlur = () => {
    const cleaned = slug.replace(/-+$/, '');
    setSlug(cleaned);
    if (cleaned === '') {
      setSlugEdited(false);
      setSlug(toSlugLive(name));
    }
  };

  function handleOrganizationSubmit() {
    const cleanedSlug = slug.replace(/-+$/, '');
    const validation = workspaceDetailsSchema.safeParse({ name, slug: cleanedSlug });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Invalid organization details.');
      return;
    }
    setSlug(cleanedSlug);
    goToStep('use-case');
  }

  function handleCreateOrganization() {
    const cleanedSlug = slug.replace(/-+$/, '');
    // Validate final values with Zod before submission
    const validation = workspaceDetailsSchema.safeParse({ name, slug: cleanedSlug });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Invalid organization details.');
      goToStep('organization');
      return;
    }

    goToStep('creating');
    setError(null);

    startTransition(async () => {
      const result = await authClient.organization.create({
        name: name.trim(),
        slug: cleanedSlug,
        ...(intent ? { metadata: { intent } } : {})
      });

      if (result.error) {
        setError(result.error.message ?? 'Failed to create organization.');
        goToStep('invite');
        return;
      }

      // Set the newly created org as active
      if (result.data?.id) {
        await authClient.organization.setActive({
          organizationId: result.data.id
        });

        // Mark onboarding complete on the user profile
        await completeOnboarding({});

        // Send invite emails (fire-and-forget, don't block navigation)
        const validEmails = inviteEmails.filter(email => onboardingEmailSchema.safeParse(email.trim()).success);
        if (validEmails.length > 0) {
          await Promise.allSettled(
            validEmails.map(email =>
              authClient.organization.inviteMember({
                email: email.trim(),
                organizationId: result.data.id,
                role: 'learner'
              })
            )
          );
        }
      }

      router.push(`/organization/${slug}/dashboard` as Route);
    });
  }

  /**
   * Keyboard navigation handler.
   * - Enter: advance to the next step (or submit).
   * - Escape: go back to the previous step.
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't intercept when user is typing in an input field
      const target = event.target as HTMLElement;

      if (target.tagName === 'INPUT' && event.key !== 'Enter') return;

      if (event.key === 'Enter') {
        event.preventDefault();
        if (step === 'organization') handleOrganizationSubmit();
        else if (step === 'use-case') goToStep('invite');
        else if (step === 'invite') handleCreateOrganization();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        if (step === 'use-case') goToStep('organization');
        else if (step === 'invite') goToStep('use-case');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, name, slug, slugEdited, intent, inviteEmails, isPending]
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
                if (index < stepIndex)
                  if (targetStep) goToStep(targetStep);
                  else if (index === 1 && step === 'organization' && name.trim() && slug.trim() && slug.length >= 3)
                    goToStep('use-case');
                  else if (index === 2 && step === 'use-case') goToStep('invite');
              }}
            />
          </div>
        )}

        <AnimatePresence custom={direction} initial={false} mode='wait'>
          {step === 'organization' && (
            <motion.div
              key='organization'
              className='mt-10 flex flex-col gap-6'
              animate='center'
              custom={direction}
              exit='exit'
              initial='enter'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              variants={SLIDE_VARIANTS}
            >
              <div className='text-center'>
                <h2 className='text-2xl font-bold tracking-tight'>Organization Name</h2>
                <p className='mt-2 text-base text-muted-foreground'>
                  Enter your organization&apos;s name. This is the name your team will see.
                </p>
              </div>

              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className='flex flex-col gap-5'>
                <Input
                  autoFocus
                  isRequired
                  label='Organization Name'
                  value={name}
                  onChange={event => handleNameChange(event.target.value)}
                />
                <div className='flex flex-col gap-1'>
                  <InputURL
                    isRequired
                    tooltip={
                      <Tooltip content="Your organization's unique URL identifier.">
                        <button
                          className='relative z-10 inline-flex h-3.5 w-3.5 shrink-0 cursor-help items-center justify-center border-none bg-transparent p-0 text-muted-foreground/50 transition-colors hover:text-foreground focus:outline-none'
                          type='button'
                        >
                          <QuestionCircleIcon size={14} />
                        </button>
                      </Tooltip>
                    }
                    label='Organization URL'
                    placeholder='name'
                    prefix='courseroad.xyz/organization/'
                    value={slug}
                    onBlur={handleSlugBlur}
                    onChange={e => handleSlugChange(e.target.value)}
                  />
                </div>
              </div>

              <div className='flex gap-2'>
                <Button
                  className='flex-1 cursor-pointer'
                  color='secondary'
                  onPress={() => router.push('/onboarding' as Route)}
                >
                  Back
                </Button>
                <Button className='flex-1 cursor-pointer' color='primary' onPress={handleOrganizationSubmit}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'use-case' && (
            <motion.div
              key='use-case'
              className='mt-10 flex flex-col gap-4'
              animate='center'
              custom={direction}
              exit='exit'
              initial='enter'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              variants={SLIDE_VARIANTS}
            >
              <div className='text-center'>
                <h2 className='text-2xl font-bold tracking-tight'>Use Case</h2>
                <p className='mt-2 text-base text-muted-foreground'>
                  Select the use case for your organization. This helps us tailor your experience.
                </p>
              </div>

              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <IntentSelector selected={intent} onSelect={setIntent} />

              <div className='flex gap-2'>
                <Button className='flex-1 cursor-pointer' color='secondary' onPress={() => goToStep('organization')}>
                  Back
                </Button>
                <Button
                  className='flex-1 cursor-pointer'
                  color='primary'
                  isLoading={isPending}
                  spinner={<Spinner color='current' size='sm' />}
                  onPress={() => goToStep('invite')}
                >
                  {intent ? 'Continue' : 'Skip & Continue'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'invite' && (
            <motion.div
              key='invite'
              className='mt-10 flex flex-col gap-4'
              animate='center'
              custom={direction}
              exit='exit'
              initial='enter'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              variants={SLIDE_VARIANTS}
            >
              <div className='text-center'>
                <h2 className='text-2xl font-bold tracking-tight'>Invite your team</h2>
                <p className='mt-2 text-base text-muted-foreground'>
                  Add your team members now or invite them later in the organization dashboard.
                </p>
              </div>

              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <InviteTeam emails={inviteEmails} onEmailsChange={setInviteEmails} />

              <div className='flex gap-2'>
                <Button className='flex-1 cursor-pointer' color='secondary' onPress={() => goToStep('use-case')}>
                  Back
                </Button>
                <Button
                  className='flex-1 cursor-pointer'
                  color='primary'
                  isLoading={isPending}
                  spinner={<Spinner color='current' size='sm' />}
                  onPress={handleCreateOrganization}
                >
                  {inviteEmails.length > 0 ? 'Create Organization' : 'Skip & Create'}
                </Button>
              </div>
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
                <h2 className='text-lg font-bold'>Setting up your organization...</h2>
                <p className='mt-1 text-sm text-muted-foreground'>This will only take a moment.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
