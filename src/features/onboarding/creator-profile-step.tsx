'use client';

import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { Avatar, Button, ImageCropperDialog, Input, InputURL } from '@courseroad/iota-ui';
import { Alert, AlertDescription } from '@courseroad/kurume-ui';
import {
  PenLinear as PenIcon,
  TrashBinMinimalisticLinear as TrashIcon,
  UploadLinear as UploadIcon
} from '@solar-icons/react-perf';
import { User } from 'lucide-react';

import { GitHubIcon } from '@/assets/icons/github-icon';
import { TwitterIcon } from '@/assets/icons/twitter-icon';

interface CreatorProfileStepProps {
  error: string | null;
  firstName: string;
  githubUrl: string;
  image: string | null;
  lastName: string;
  onContinue: () => void;
  setFirstName: (value: string) => void;
  setGithubUrl: (value: string) => void;
  setImage: (value: string | null) => void;
  setLastName: (value: string) => void;
  setUsername: (value: string) => void;
  setWebsiteUrl: (value: string) => void;
  setTwitterUrl: (value: string) => void;
  twitterUrl: string;
  username: string;
  websiteUrl: string;
}

/**
 * CreatorProfileStep renders the profile setup step of the creator onboarding flow.
 * Captures name, username, profile picture, and web links (Website, GitHub, Twitter).
 */
export function CreatorProfileStep({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  username,
  setUsername,
  websiteUrl,
  setWebsiteUrl,
  twitterUrl,
  setTwitterUrl,
  githubUrl,
  setGithubUrl,
  image,
  setImage,
  error,
  onContinue
}: CreatorProfileStepProps) {
  const router = useRouter();
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

  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold tracking-tight'>Profile Setup</h2>
        <p className='mt-2 text-base text-muted-foreground'>
          Tell us a bit about your teaching background and details.
        </p>
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className='flex flex-col items-center justify-center gap-3'>
        <div className='relative size-[96px]'>
          <button
            className='group relative size-full shrink-0 cursor-pointer overflow-hidden rounded-full bg-transparent p-0 outline-none'
            type='button'
            onClick={() => {
              if (image) {
                setImage(null);
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
                icon: 'size-8 text-zinc-600'
              }}
              icon={<User className='size-8 text-zinc-600' />}
              size={96}
              src={image}
            />
            {image ? (
              <div className='absolute inset-0 flex items-center justify-center bg-red-500/30 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100'>
                <TrashIcon className='size-8 text-red-200' />
              </div>
            ) : (
              <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100'>
                <UploadIcon className='size-8 text-white' />
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
      </div>

      <div className='flex flex-col gap-5'>
        <div className='grid grid-cols-2 gap-3'>
          <Input isRequired label='First Name' value={firstName} onChange={event => setFirstName(event.target.value)} />
          <Input isRequired label='Last Name' value={lastName} onChange={event => setLastName(event.target.value)} />
        </div>
        <Input isRequired label='Username' value={username} onChange={event => setUsername(event.target.value)} />
        <InputURL
          label='Website'
          placeholder='website.com'
          prefix='https://'
          value={websiteUrl}
          onChange={event => setWebsiteUrl(event.target.value)}
        />
        <InputURL
          label='GitHub Profile'
          placeholder='username'
          prefix='https://github.com/'
          startContent={<GitHubIcon className='text-zinc-500' height={24} width={24} />}
          value={githubUrl}
          onChange={event => setGithubUrl(event.target.value)}
        />
        <InputURL
          label='Twitter Profile'
          placeholder='username'
          prefix='https://x.com/'
          startContent={<TwitterIcon className='m-[1px] size-[18px] text-zinc-500' />}
          value={twitterUrl}
          onChange={event => setTwitterUrl(event.target.value)}
        />
      </div>

      <div className='flex gap-2'>
        <Button className='flex-1 cursor-pointer' color='secondary' onPress={() => router.push('/onboarding' as Route)}>
          Back
        </Button>
        <Button className='flex-1 cursor-pointer' color='primary' onPress={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
