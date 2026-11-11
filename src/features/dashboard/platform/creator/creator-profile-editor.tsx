'use client';

import type { ChangeEvent, JSX, SVGProps, SyntheticEvent } from 'react';
import { useRef, useState, useTransition } from 'react';

import { Avatar, Button, ImageCropperDialog, Input } from '@courseroad/iota-ui';
import { Alert, AlertDescription, Textarea } from '@kurume-ui/core';
import {
  PenLinear as PenIcon,
  TrashBinMinimalisticLinear as TrashIcon,
  UploadLinear as UploadIcon
} from '@solar-icons/react-perf';
import { Globe, Loader2, Save, User } from 'lucide-react';

import { updateInstructorProfile } from '@/features/auth/actions/profile-actions';

function TwitterIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      fill='none'
      height='24'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      viewBox='0 0 24 24'
      width='24'
      {...props}
    >
      <path d='M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' />
    </svg>
  );
}

function GithubIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      fill='none'
      height='24'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      viewBox='0 0 24 24'
      width='24'
      {...props}
    >
      <path d='M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4' />
      <path d='M9 18c-4.51 2-5-2-7-2' />
    </svg>
  );
}

interface CreatorProfileEditorProps {
  initialProfile: {
    bio: string | null;
    firstName: string;
    githubUrl: string | null;
    image: string | null;
    lastName: string;
    twitterUrl: string | null;
    username: string;
    websiteUrl: string | null;
  };
}

export function CreatorProfileEditor({ initialProfile }: CreatorProfileEditorProps): JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [firstName, setFirstName] = useState(initialProfile.firstName);
  const [lastName, setLastName] = useState(initialProfile.lastName);
  const [username, setUsername] = useState(initialProfile.username);
  const [image, setImage] = useState(initialProfile.image || '');
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialProfile.websiteUrl || '');
  const [twitterUrl, setTwitterUrl] = useState(initialProfile.twitterUrl || '');
  const [githubUrl, setGithubUrl] = useState(initialProfile.githubUrl || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setIsCropperOpen(true);
        event.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const result = await updateInstructorProfile({
          bio: bio || null,
          firstName,
          githubUrl: githubUrl || null,
          image: image || null,
          lastName,
          twitterUrl: twitterUrl || null,
          username,
          websiteUrl: websiteUrl || null
        });

        if (result.success) {
          setSuccess(true);
        } else {
          setError(result.error || 'Failed to update profile.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while saving.');
      }
    });
  };

  return (
    <div className='mx-auto max-w-4xl'>
      <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>Profile updated successfully!</AlertDescription>
          </Alert>
        )}

        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {/* Avatar / Summary Column */}
          <div className='flex flex-col items-center text-center'>
            <div className='border-default-200/50 flex w-full flex-col items-center gap-6 rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
              <div className='relative size-32'>
                <button
                  className='group relative size-full shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-primary/20 bg-transparent p-0 outline-none'
                  type='button'
                  onClick={() => {
                    if (image) {
                      setImage('');
                      setOriginalImage(null);
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <Avatar
                    className='h-full w-full'
                    name={firstName || lastName ? `${firstName} ${lastName}`.trim() : undefined}
                    classNames={{
                      img: 'h-full w-full object-cover',
                      icon: 'size-12 text-zinc-600'
                    }}
                    icon={<User className='size-12 text-zinc-600' />}
                    size={128}
                    src={image || undefined}
                  />
                  {image ? (
                    <div className='absolute inset-0 flex items-center justify-center bg-red-500/30 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100'>
                      <TrashIcon className='size-10 text-red-200' />
                    </div>
                  ) : (
                    <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100'>
                      <UploadIcon className='size-10 text-white' />
                    </div>
                  )}
                </button>

                {image && (
                  <button
                    className='absolute -top-1 -right-1 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-200 shadow-lg transition-transform hover:scale-105 hover:bg-zinc-800 focus:outline-none'
                    type='button'
                    title='Adjust Crop'
                    onClick={e => {
                      e.stopPropagation();
                      setTempImage(originalImage || image);
                      setIsCropperOpen(true);
                    }}
                  >
                    <PenIcon className='size-4' />
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                className='hidden'
                type='file'
                accept='image/png, image/jpeg, image/webp'
                onChange={handleFileChange}
              />

              <ImageCropperDialog
                circular
                aspectRatio={1}
                open={isCropperOpen}
                src={tempImage}
                onCancel={() => {
                  setTempImage(null);
                }}
                onOpenChange={setIsCropperOpen}
                onSave={croppedUrl => {
                  setImage(croppedUrl);
                  setOriginalImage(tempImage);
                  setTempImage(null);
                }}
              />

              <div className='w-full'>
                <h3 className='text-lg font-bold text-foreground'>
                  {firstName} {lastName}
                </h3>
                <p className='text-sm text-muted-foreground'>@{username || 'instructor'}</p>
                <span className='mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary uppercase'>
                  B2C Creator
                </span>
              </div>

              <div className='w-full text-center'>
                <span className='text-xs text-muted-foreground'>Click avatar to upload or crop image</span>
              </div>
            </div>
          </div>

          {/* Profile Details Column */}
          <div className='flex flex-col gap-6 md:col-span-2'>
            {/* Basic Info Card */}
            <div className='border-default-200/50 flex flex-col gap-6 rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
              <h4 className='border-default-200/50 border-b pb-3 text-base font-bold text-foreground'>
                Basic Profile Information
              </h4>

              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <Input
                  isRequired
                  label='First Name'
                  placeholder='Jane'
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
                <Input
                  isRequired
                  label='Last Name'
                  placeholder='Doe'
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>

              <Input
                isRequired
                label='Username'
                placeholder='janedoe'
                value={username}
                onChange={e => setUsername(e.target.value)}
              />

              <div className='flex flex-col gap-1.5'>
                <label className='text-sm font-semibold text-foreground'>Biography</label>
                <Textarea
                  className='border-default-200/50 min-h-[120px] rounded-2xl bg-background/50 text-sm focus:border-primary/50'
                  placeholder='Share a brief bio about your expertise, experience, and background for your public profile page...'
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                />
              </div>
            </div>

            {/* Social / Links Card */}
            <div className='border-default-200/50 flex flex-col gap-6 rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
              <h4 className='border-default-200/50 border-b pb-3 text-base font-bold text-foreground'>
                Social Media & Links
              </h4>

              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2'>
                  <Globe className='size-5 shrink-0 text-muted-foreground' />
                  <div className='grow'>
                    <Input
                      label='Personal Website'
                      placeholder='https://mywebsite.com'
                      value={websiteUrl}
                      onChange={e => setWebsiteUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <TwitterIcon className='m-[1px] size-[18px] shrink-0 text-muted-foreground' />
                  <div className='grow'>
                    <Input
                      label='Twitter Profile'
                      placeholder='https://twitter.com/myhandle'
                      value={twitterUrl}
                      onChange={e => setTwitterUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <GithubIcon className='size-5 shrink-0 text-muted-foreground' />
                  <div className='grow'>
                    <Input
                      label='GitHub Profile'
                      placeholder='https://github.com/myusername'
                      value={githubUrl}
                      onChange={e => setGithubUrl(e.target.value)} // Wait! lowercase 'githubUrl' typo? Let's check
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className='flex justify-end gap-4'>
              <Button
                className='flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold'
                type='submit'
                color='primary'
                disabled={isPending}
              >
                {isPending ? <Loader2 className='size-4 animate-spin' /> : <Save className='size-4' />}
                <span>Save Profile Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
