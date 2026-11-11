'use client';

import type { JSX } from 'react';
import { useState } from 'react';

import { Switch } from '@courseroad/iota-ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  FieldGroup,
  HelpTooltip,
  Label,
  NumberInput,
  PriceInput
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
import { ImageUpload } from '@/features/media/image-upload';
import { VideoUpload } from '@/features/media/video-upload';

export function CourseDetails(): JSX.Element {
  const form = useFormContext();
  const [showIntroVideo, setShowIntroVideo] = useState(() => !!form.getValues('introVideoUrl'));

  return (
    <div className='grid grid-cols-1 gap-6 2xl-screen:grid-cols-3'>
      {/* Main Column (2/3) */}
      <div className='space-y-6 2xl-screen:col-span-2'>
        {/* Course Details */}
        <Card>
          <CardHeader>
            <CardTitle icon={<BookOpen />} iconColor='primary' iconVariant='glow'>
              Course Details
            </CardTitle>
            <CardDescription>Configure your course identity and settings.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <FieldGroup>
              <div className='grid grid-cols-1 gap-6 lg-screen:grid-cols-2'>
                <Controller
                  name='title'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpTooltip id='course-title' help='Add a title for your course' label='Title' />
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
                      <HelpTooltip id='course-slug' help='Create or generate a URL slug' label='Slug' />
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

              <div className='grid grid-cols-1 gap-6 xs-screen:grid-cols-2'>
                <Controller
                  name='category'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpTooltip
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
                      <HelpTooltip id='course-level' help='Select the difficulty level of the course' label='Level' />
                      <LevelInput id='course-level' value={field.value} onChange={field.onChange} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                  control={form.control}
                />
              </div>

              <div className='grid grid-cols-1 gap-6 xs-screen:grid-cols-2'>
                <Controller
                  name='price'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpTooltip id='course-price' help='Set the price of the course' label='Price' />
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
                      <HelpTooltip id='course-duration' help='Set the total duration of the course' label='Duration' />
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
            <CardTitle icon={<FileText />} iconColor='primary' iconVariant='glow'>
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
                    <HelpTooltip
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
                    <HelpTooltip
                      id='course-description'
                      help='Explain in detail what the course is about'
                      label='Description'
                    />
                    <DescriptionInput value={field.value} onChange={field.onChange} />
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
              <CardTitle icon={<Settings />} iconColor='primary' iconVariant='glow'>
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
              <CardTitle icon={<ImageIcon />} iconColor='primary' iconVariant='glow'>
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
                      <HelpTooltip
                        id='course-fileKey'
                        help='Upload the thumbnail image for the course'
                        label='Thumbnail'
                      />
                      <ImageUpload
                        scope='course-cover'
                        value={field.value}
                        onChange={(url: string | null) => field.onChange(url)}
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
                        <HelpTooltip
                          id='course-intro-video'
                          help='Upload the introduction video for the course'
                          label='Intro Video'
                        />
                        <VideoUpload
                          onUploadComplete={(url: string, videoId: string) => {
                            field.onChange(url);
                            form.setValue('introVideoGuid', videoId, { shouldDirty: true });
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
