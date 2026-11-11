'use client';

import type { JSX } from 'react';
import { useState } from 'react';

import type { FieldValues } from 'react-hook-form';

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
  Switch
} from '@courseroad/kurume-ui';
import { FileText, ImageIcon, Settings, SettingsIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { TitleInput } from '@/components/shared/title-input';

import { ImageUpload } from '@/features/media/image-upload';

import { QuizMarkdownEditor } from './quiz-markdown-editor';

interface QuizDetailsProps {
  onSubmit: (values: FieldValues) => void;
}

export function QuizDetails({ onSubmit }: QuizDetailsProps): JSX.Element {
  const form = useFormContext();

  const thumbnailUrl = useWatch({ control: form.control, name: 'thumbnailUrl' });
  const [useCustomThumbnail, setUseCustomThumbnail] = useState(Boolean(thumbnailUrl));

  return (
    <form className='contents' id='quiz-details-form' onSubmit={form.handleSubmit(onSubmit)}>
      <div className='grid grid-cols-1 gap-6 4xl-screen:grid-cols-5'>
        {/* Main column (column space: 3/5), title, description, and thumbnail */}
        <div className='space-y-6 4xl-screen:col-span-3'>
          <Card>
            <CardHeader>
              <CardTitle icon={<FileText />} iconColor='primary' iconVariant='glow'>
                Quiz Description
              </CardTitle>
              <CardDescription>The core details of your quiz. A clear title helps learners find it.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <FieldGroup>
                <Controller
                  name='title'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpTooltip id='quiz-title' help='Add a title for your quiz' label='Title' />
                      <TitleInput id='quiz-title' value={field.value} onChange={field.onChange} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                  control={form.control}
                />

                <Controller
                  name='description'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpTooltip id='quiz-description' help='Describe the quiz objectives...' label='Description' />
                      <QuizMarkdownEditor
                        placeholder='Describe the quiz objectives...'
                        value={field.value ?? ''}
                        onChange={field.onChange}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                  control={form.control}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Quiz Thumbnail (shown when custom thumbnail is enabled) */}
          <AnimatePresence>
            {useCustomThumbnail && (
              <motion.div
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle icon={<ImageIcon />} iconColor='primary' iconVariant='glow'>
                      Quiz Thumbnail
                    </CardTitle>
                    <CardDescription>Upload a cover image for your quiz.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Controller
                      name='thumbnailUrl'
                      render={({ field }) => (
                        <ImageUpload
                          scope='quiz-thumbnail'
                          value={field.value ?? null}
                          onChange={(url: string | null) => field.onChange(url)}
                        />
                      )}
                      control={form.control}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar column (column space: 2/5), quiz settings and configuration */}
        <div className='space-y-6 4xl-screen:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle icon={<SettingsIcon />} iconColor='primary' iconVariant='glow'>
                Quiz Settings
              </CardTitle>
              <CardDescription>Configure quiz behavior and display.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 2xl-screen:grid-cols-2'>
                <div className='flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='quiz-shuffleQuestions'>Shuffle Questions</Label>
                    <p className='text-xs text-muted-foreground'>Randomize order of questions</p>
                  </div>
                  <Controller
                    name='shuffleQuestions'
                    render={({ field }) => (
                      <Switch
                        id='quiz-shuffleQuestions'
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    )}
                    control={form.control}
                  />
                </div>

                <div className='flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='quiz-showCorrectAnswers'>Show Correct Answers</Label>
                    <p className='text-xs text-muted-foreground'>Display answers after submission</p>
                  </div>
                  <Controller
                    name='showCorrectAnswers'
                    render={({ field }) => (
                      <Switch
                        id='quiz-showCorrectAnswers'
                        checked={field.value ?? true}
                        onCheckedChange={field.onChange}
                      />
                    )}
                    control={form.control}
                  />
                </div>

                <div className='flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='quiz-useCustomThumbnail'>Custom Thumbnail</Label>
                    <p className='text-xs text-muted-foreground'>Upload a custom thumbnail image</p>
                  </div>
                  <Switch
                    id='quiz-useCustomThumbnail'
                    checked={useCustomThumbnail}
                    onCheckedChange={checked => {
                      setUseCustomThumbnail(checked);
                      if (!checked) {
                        form.setValue('thumbnailUrl', null, { shouldDirty: true });
                      }
                    }}
                  />
                </div>

                <div className='flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='quiz-showTimer'>Show Timer</Label>
                    <p className='text-xs text-muted-foreground'>Display countdown during quiz</p>
                  </div>
                  <Controller
                    name='showTimer'
                    render={({ field }) => (
                      <Switch id='quiz-showTimer' checked={field.value ?? true} onCheckedChange={field.onChange} />
                    )}
                    control={form.control}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle icon={<Settings />} iconColor='primary' iconVariant='glow'>
                Quiz Configuration
              </CardTitle>
              <CardDescription>Timing and grading settings.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <FieldGroup>
                {/* Time limit */}
                <Controller
                  name='timeLimit'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpTooltip
                        id='quiz-timeLimit'
                        help='Set a time limit for the quiz. Leave empty for no limit.'
                        label='Time Limit'
                      />
                      <NumberInput
                        id='quiz-timeLimit'
                        showSeconds
                        format='time'
                        value={field.value}
                        onChangeValue={field.onChange}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                  control={form.control}
                />

                {/* Allowed attempts */}
                <Controller
                  name='allowedAttempts'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpTooltip
                        id='quiz-allowedAttempts'
                        help='Maximum number of allowed attempts per learner. Leave empty for unlimited.'
                        label='Max Attempts'
                      />
                      <NumberInput
                        id='quiz-allowedAttempts'
                        format='standard'
                        label='Max Attempts'
                        max={100}
                        min={1}
                        placeholder='0 max attempts'
                        value={field.value}
                        onChangeValue={field.onChange}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                  control={form.control}
                />

                {/* Passing score */}
                <Controller
                  name='passingScore'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <HelpTooltip
                        id='quiz-passingScore'
                        help='Minimum percentage required to pass the quiz. Leave empty for no requirement.'
                        label='Passing Score'
                      />
                      <NumberInput
                        id='quiz-passingScore'
                        format='percentage'
                        label='Passing Score'
                        max={100}
                        min={0}
                        placeholder='0% passing score'
                        value={field.value}
                        onChangeValue={field.onChange}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                  control={form.control}
                />
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
