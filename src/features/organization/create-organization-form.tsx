'use client';

import { useState, useTransition } from 'react';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { QuestionCircleLinear as QuestionCircleIcon } from '@solar-icons/react-perf';
import { Building2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { authClient } from '@/lib/auth/auth-client';

import {
  Button,
  Card,
  ImageUploader,
  Input,
  InputURL,
  showToast,
  Spinner,
  StepperBasic,
  Tooltip
} from '@courseroad/iota-ui';
import { Alert, AlertDescription, Badge } from '@courseroad/kurume-ui';

type CreateOrgStep = 'details' | 'logo' | 'review';

// Generates a URL-safe slug from a display name during active typing.
function toSlugLive(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '');
}

const STEP_ORDER: CreateOrgStep[] = ['details', 'logo', 'review'];
const STEPPER_STEPS = [{ title: 'Details' }, { title: 'Logo' }, { title: 'Review' }];

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
 * Multi-step organization creation form using `@courseroad/iota-ui` visual primitives
 * and slide animation transitions to match the onboarding wizard style.
 *
 * Step 1: Name + auto-generated editable slug.
 * Step 2: Optional logo URL input.
 * Step 3: Review and confirm.
 */
export function CreateOrganizationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<CreateOrgStep>('details');
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEP_ORDER.indexOf(step);

  function goToStep(target: CreateOrgStep) {
    const targetIndex = STEP_ORDER.indexOf(target);
    setDirection(targetIndex > stepIndex ? 1 : -1);
    setError(null);
    setStep(target);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) {
      setSlug(toSlugLive(value));
    }
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

  function goNext() {
    setError(null);
    if (step === 'details') {
      if (!name.trim()) {
        setError('Organization name is required.');
        return;
      }
      const cleanedSlug = slug.replace(/-+$/, '');
      if (!cleanedSlug || cleanedSlug.length < 3) {
        setError('Slug must be at least 3 characters.');
        return;
      }
      setSlug(cleanedSlug);
      goToStep('logo');
    } else if (step === 'logo') {
      goToStep('review');
    }
  }

  function goBack() {
    setError(null);
    if (step === 'logo') goToStep('details');
    else if (step === 'review') goToStep('logo');
  }

  function handleSubmit() {
    setError(null);
    const cleanedSlug = slug.replace(/-+$/, '');
    startTransition(async () => {
      const result = await authClient.organization.create({
        logo: logoUrl || undefined,
        name: name.trim(),
        slug: cleanedSlug
      });

      if (result.error) {
        setError(result.error.message ?? 'Failed to create organization.');
        return;
      }

      showToast({
        description: `"${name}" has been created successfully.`,
        scheme: 'success',
        title: 'Organization created'
      });

      router.push(`/organization/${slug}` as Route);
    });
  }

  return (
    <motion.div
      className='w-full max-w-md'
      animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      initial={{ filter: 'blur(4px)', opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className='flex w-full flex-col gap-4 overflow-hidden p-8'>
        <div className='-mx-4'>
          <StepperBasic
            currentStep={stepIndex}
            steps={STEPPER_STEPS}
            onStepChange={index => {
              if (index < stepIndex) {
                const targetStep = STEP_ORDER[index];
                if (targetStep) goToStep(targetStep);
              } else if (index === 1 && step === 'details' && name.trim() && slug.trim() && slug.length >= 3) {
                goToStep('logo');
              } else if (index === 2 && step === 'logo') {
                goToStep('review');
              }
            }}
          />
        </div>

        <AnimatePresence custom={direction} initial={false} mode='wait'>
          {step === 'details' && (
            <motion.div
              key='details'
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
                    onChange={event => handleSlugChange(event.target.value)}
                  />
                </div>
              </div>

              <div className='flex gap-2'>
                <Button
                  className='flex-1 cursor-pointer'
                  color='secondary'
                  onPress={() => router.push('/select-organization' as Route)}
                >
                  Back
                </Button>
                <Button className='flex-1 cursor-pointer' color='primary' onPress={goNext}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'logo' && (
            <motion.div
              key='logo'
              className='mt-10 flex flex-col gap-6'
              animate='center'
              custom={direction}
              exit='exit'
              initial='enter'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              variants={SLIDE_VARIANTS}
            >
              <div className='text-center'>
                <h2 className='text-2xl font-bold tracking-tight'>Organization Logo</h2>
                <p className='mt-2 text-base text-muted-foreground'>
                  Add a logo to help members identify your organization. You can skip this.
                </p>
              </div>

              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className='flex flex-col gap-5'>
                <ImageUploader
                  aspectRatio={1}
                  cropper={true}
                  maxSizeMB={2}
                  showUrlInput={false}
                  value={logoUrl}
                  onChange={url => setLogoUrl(url || '')}
                />
              </div>

              <div className='flex gap-2'>
                <Button className='flex-1 cursor-pointer' color='secondary' onPress={goBack}>
                  Back
                </Button>
                <Button className='flex-1 cursor-pointer' color='primary' onPress={goNext}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div
              key='review'
              className='mt-10 flex flex-col gap-6'
              animate='center'
              custom={direction}
              exit='exit'
              initial='enter'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              variants={SLIDE_VARIANTS}
            >
              <div className='text-center'>
                <h2 className='text-2xl font-bold tracking-tight'>Review & Create</h2>
                <p className='mt-2 text-base text-muted-foreground'>
                  Confirm your organization details before creating.
                </p>
              </div>

              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className='space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5'>
                <div className='flex items-center gap-4'>
                  <div className='flex size-14 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900'>
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className='size-10 rounded-lg object-cover' alt={name} src={logoUrl} />
                    ) : (
                      <Building2 className='size-7 text-zinc-400' />
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate font-semibold text-zinc-200'>{name}</p>
                    <p className='truncate text-xs text-muted-foreground'>courseroad.dev/organization/{slug}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2 border-t border-zinc-800/60 pt-3'>
                  <Badge variant='secondary'>Owner</Badge>
                  <span className='text-xs text-muted-foreground'>You will be the owner of this organization.</span>
                </div>
              </div>

              <div className='flex gap-2'>
                <Button className='flex-1 cursor-pointer' color='secondary' onPress={goBack}>
                  Back
                </Button>
                <Button
                  className='flex-1 cursor-pointer'
                  color='primary'
                  isLoading={isPending}
                  spinner={<Spinner color='current' size='sm' />}
                  onPress={handleSubmit}
                >
                  Create Organization
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
