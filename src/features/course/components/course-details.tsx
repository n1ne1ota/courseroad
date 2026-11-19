'use client';

import type { JSX } from 'react';
import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  FieldGroup,
  HelpPopover,
  Label,
  NumberInput,
  PriceInput,
  Switch
} from '@courseroad/kurume-ui';

import { BookOpen, FileText, ImageIcon, Settings } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';

import { currencies } from '@/lib/config/data';

import { TitleInput } from '@/components/shared/title-input';

import { CategoryInput } from '@/features/course/components/category-input';
import { DescriptionInput } from '@/features/course/components/description-input';
import { LevelInput } from '@/features/course/components/level-input';
import { ShortDescriptionInput } from '@/features/course/components/short-description-input';
import { SlugInput } from '@/features/course/components/slug-input';
import { ImageUpload } from '@/features/media/components/image-upload';
import { VideoUpload } from '@/features/media/components/video-upload';

export function CourseDetails({ disabled = false }: { disabled?: boolean }): JSX.Element {
  const form = useFormContext();
  const [showIntroVideo, setShowIntroVideo] = useState(() => !!form.getValues('introVideoUrl'));

  return (
    <div className='grid grid-cols-1 gap-6 2xl-screen:grid-cols-3'>
      {/* Main Column (2/3) */}
      <div className='space-y-6 2xl-screen:col-span-2'>
        {/* Course Details */}
        <Card>
          <CardHeader>
            <CardTitle icon={<BookOpen />} iconColor='brand' iconVariant='soft'>
              Course Details
            </CardTitle>
            <CardDescription>Configure your course identity and settings.</CardDescription>
          </CardHeader>
          <CardContent className='@container/course-details space-y-6'>
            <FieldGroup>
              <div className='grid grid-cols-1 gap-6 @lg/course-details:grid-cols-2'>
                <Controller
                  name='title'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpPopover id='course-title' help='Add a title for your course' label='Title' />
                      <TitleInput id='course-title' value={field.value} onChange={field.onChange} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                  control={form.control}
                />

                <Controller
                  name='slug'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpPopover id='course-slug' help='Create or generate a URL slug' label='Slug' />
                      <SlugInput
                        id='course-slug'
                        baseTitle={form.getValues('title')}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                  control={form.control}
                />
              </div>

              <div className='grid grid-cols-1 gap-6 @lg/course-details:grid-cols-2 @3xl/course-details:grid-cols-[repeat(2,minmax(0,1fr))_minmax(0,0.75fr)_minmax(0,1.25fr)]'>
                <Controller
                  name='category'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpPopover
                        id='course-category'
                        help='Select a category the course belongs in'
                        label='Category'
                      />
                      <CategoryInput id='course-category' value={field.value} onChange={field.onChange} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                  control={form.control}
                />

                <Controller
                  name='level'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpPopover id='course-level' help='Select the difficulty level of the course' label='Level' />
                      <LevelInput id='course-level' value={field.value} onChange={field.onChange} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                  control={form.control}
                />
                <Controller
                  name='price'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpPopover id='course-price' help='Set the price of the course' label='Price' />
                      <PriceInput
                        id='course-price'
                        currencies={currencies}
                        min={0}
                        value={field.value}
                        onChangeValue={field.onChange}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                  control={form.control}
                />

                <Controller
                  name='duration'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpPopover id='course-duration' help='Set the total duration of the course' label='Duration' />
                      <NumberInput
                        id='course-duration'
                        format='time'
                        label='Duration'
                        value={field.value}
                        onChangeValue={field.onChange}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                  control={form.control}
                />
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Course Description */}
        <Card>
          <CardHeader>
            <CardTitle icon={<FileText />} iconColor='brand' iconVariant='soft'>
              Course Description
            </CardTitle>
            <CardDescription>Describe your course for learners and search engines.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <FieldGroup>
              <Controller
                name='shortDescription'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <HelpPopover
                      id='course-short-description'
                      help='Describe concisely what the course is about'
                      label='Short Description'
                    />
                    <ShortDescriptionInput
                      id='course-short-description'
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
                control={form.control}
              />

              <Controller
                name='description'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <HelpPopover
                      id='course-description'
                      help='Explain in detail what the course is about'
                      label='Description'
                    />
                    <div id='course-description'>
                      <DescriptionInput disabled={disabled} value={field.value} onChange={field.onChange} />
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
                control={form.control}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Column (1/3) */}
      <div className='2xl-screen:col-span-1'>
        <div className='sticky top-6 space-y-6'>
          {/* Course Behavior */}
          <Card>
            <CardHeader>
              <CardTitle icon={<Settings />} iconColor='brand' iconVariant='soft'>
                Course Behavior
              </CardTitle>
              <CardDescription>Configure how the course behaves.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4'>
                <div className='flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='course-introVideo'>Intro Video</Label>
                    <p className='text-xs text-muted-foreground'>Include an introduction video</p>
                  </div>
                  <Switch
                    id='course-introVideo'
                    checked={showIntroVideo}
                    onCheckedChange={checked => {
                      setShowIntroVideo(checked);
                      if (!checked) {
                        form.setValue('introVideoUrl', '', { shouldDirty: true });
                        form.setValue('introVideoGuid', '', { shouldDirty: true });
                        form.setValue('introVideoFileName', '', { shouldDirty: true });
                        form.setValue('introVideoFileSize', 0, { shouldDirty: true });
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Media */}
          <Card>
            <CardHeader>
              <CardTitle icon={<ImageIcon />} iconColor='brand' iconVariant='soft'>
                Course Media
              </CardTitle>
              <CardDescription>Thumbnail and promotional assets.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <FieldGroup>
                <Controller
                  name='fileKey'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpPopover
                        id='course-fileKey'
                        help='Upload the thumbnail image for the course'
                        label='Thumbnail'
                      />
                      <ImageUpload
                        disabled={disabled}
                        scope='course-cover'
                        value={field.value}
                        onChange={(url: string | null) => field.onChange(url ?? '')}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                  control={form.control}
                />

                {showIntroVideo && (
                  <Controller
                    name='introVideoUrl'
                    render={({ field }) => (
                      <Field>
                        <HelpPopover
                          id='course-intro-video'
                          help='Upload the introduction video for the course'
                          label='Intro Video'
                        />
                        <VideoUpload
                          disabled={disabled}
                          fileName={form.watch('introVideoFileName')}
                          fileSize={form.watch('introVideoFileSize')}
                          title='Intro video'
                          value={field.value ?? ''}
                          onRemove={() => {
                            field.onChange('');
                            form.setValue('introVideoGuid', '', { shouldDirty: true });
                            form.setValue('introVideoFileName', '', { shouldDirty: true });
                            form.setValue('introVideoFileSize', 0, { shouldDirty: true });
                          }}
                          onUploadComplete={(url: string, videoId: string, file) => {
                            field.onChange(url);
                            form.setValue('introVideoGuid', videoId, { shouldDirty: true });
                            form.setValue('introVideoFileName', file?.name ?? '', { shouldDirty: true });
                            form.setValue('introVideoFileSize', file?.size ?? 0, { shouldDirty: true });
                          }}
                        />
                      </Field>
                    )}
                    control={form.control}
                  />
                )}
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
