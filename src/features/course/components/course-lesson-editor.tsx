'use client';

import type { JSX, Ref } from 'react';
import { useEffect, useImperativeHandle, useState } from 'react';

import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ConfirmationDialog,
  Field,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  showSuccessToast,
  Switch,
  Textarea
} from '@courseroad/kurume-ui';

import { ArrowRightLeft, BookOpenIcon, Edit, ImageIcon, VideoIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { LessonVideoEditor } from '@/features/course/components/lesson-video-editor';
import { SaveStatus } from '@/features/course/components/save-status';
import { useLessonAutosave } from '@/features/course/hooks/use-lesson-autosave';
import { ImageUpload } from '@/features/media/components/image-upload';
import { VideoPlayer } from '@/features/media/components/video-player';
import { VideoUpload } from '@/features/media/components/video-upload';

import type { Lesson } from '@/features/course/types/course-types';
import type { CurriculumModule, LessonEditorHandle, LessonEdits } from '@/features/course/types/curriculum-types';

interface CourseLessonEditorProps {
  lesson: Lesson;
  scope: 'platform' | 'organization';
  readOnly: boolean;
  saveLesson: (edits: LessonEdits) => Promise<Lesson>;
  onLessonChange: (lesson: Lesson) => void;
  onDirtyChange: (dirty: boolean) => void;
  modules?: CurriculumModule[];
  onMoveLesson?: (targetModuleId: string) => Promise<boolean>;
  isMovingLesson?: boolean;
  ref?: Ref<LessonEditorHandle>;
}

export function CourseLessonEditor({
  lesson,
  scope,
  readOnly,
  saveLesson,
  onLessonChange,
  onDirtyChange,
  modules,
  onMoveLesson,
  isMovingLesson = false,
  ref
}: CourseLessonEditorProps): JSX.Element {
  const autosave = useLessonAutosave(
    {
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      videoGuid: lesson.videoGuid || '',
      videoFileName: lesson.videoFileName || '',
      videoFileSize: lesson.videoFileSize ?? 0,
      videoThumbnailUrl: lesson.videoThumbnailUrl || ''
    },
    saveLesson,
    onLessonChange
  );
  const { title, description, videoUrl, videoThumbnailUrl } = autosave.values;
  const setVideoUrl = (value: string) => autosave.edit({ videoUrl: value });
  const setVideoGuid = (value: string) => autosave.edit({ videoGuid: value });
  const setVideoFile = (fileName: string, fileSize: number) =>
    autosave.edit({ videoFileName: fileName, videoFileSize: fileSize });
  const setVideoThumbnailUrl = (value: string) => autosave.edit({ videoThumbnailUrl: value });
  const [showCustomThumbnail, setShowCustomThumbnail] = useState(!!lesson.videoThumbnailUrl);
  const [showReplaceVideoDialog, setShowReplaceVideoDialog] = useState(false);
  const [moveTarget, setMoveTarget] = useState('');
  const [videoPending, setVideoPending] = useState(false);
  const [videoNotice, setVideoNotice] = useState<string | null>(null);
  const flushLesson = autosave.flush;
  const targetModules = modules
    ? modules.filter(module => module.id !== lesson.moduleId).map(module => ({ label: module.title, value: module.id }))
    : [];
  useImperativeHandle(
    ref,
    () => ({
      flush: () => {
        if (videoPending) {
          setVideoNotice('Upload or remove the selected video before leaving this lesson.');
          return Promise.resolve(false);
        }
        return flushLesson();
      }
    }),
    [flushLesson, videoPending]
  );
  useEffect(() => {
    onDirtyChange(autosave.dirty || videoPending);
  }, [autosave.dirty, videoPending, onDirtyChange]);
  return (
    <>
      <div className='grid grid-cols-1 gap-6' role='region' aria-busy={autosave.saving} aria-label='Lesson editor'>
        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle icon={<BookOpenIcon />} iconColor='brand' iconVariant='soft'>
              Lesson Details
            </CardTitle>
            <CardDescription>Basic information about this lesson.</CardDescription>
            <CardAction className='self-center'>
              <SaveStatus
                lastSavedAt={autosave.lastSaved}
                status={autosave.error ? 'error' : autosave.dirty ? 'saving' : 'saved'}
              />
            </CardAction>
          </CardHeader>
          <CardContent className='space-y-4 pt-0'>
            {autosave.error && (
              <div role='alert'>
                <p>{autosave.error}</p>
                <Button type='button' onClick={() => void autosave.flush()}>
                  Retry save
                </Button>
              </div>
            )}
            <Field>
              <FieldLabel htmlFor='lesson-title'>Title</FieldLabel>
              <Input
                id='lesson-title'
                disabled={readOnly}
                value={title}
                onChange={e => autosave.edit({ title: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor='lesson-description'>Description</FieldLabel>
              <Textarea
                className='min-h-30'
                id='lesson-description'
                disabled={readOnly}
                value={description}
                onChange={e => autosave.edit({ description: e.target.value })}
              />
            </Field>
          </CardContent>
          {onMoveLesson && modules && !readOnly && (
            <CardFooter className='border-t border-border/50 bg-muted/15'>
              <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-2'>
                  <ArrowRightLeft className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
                  <label className='text-sm font-medium text-foreground' htmlFor='lesson-destination'>
                    Move lesson to module
                  </label>
                </div>
                <div className='flex items-center gap-2'>
                  <Select
                    disabled={readOnly || isMovingLesson}
                    items={targetModules}
                    value={moveTarget || null}
                    onValueChange={next => {
                      if (next !== null) setMoveTarget(next);
                    }}
                  >
                    <SelectTrigger className='w-48' size='sm'>
                      <SelectValue placeholder='Choose module' />
                    </SelectTrigger>
                    <SelectContent>
                      {targetModules.map(module => (
                        <SelectItem key={module.value} value={module.value}>
                          {module.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <select
                    className='sr-only'
                    id='lesson-destination'
                    disabled={readOnly || isMovingLesson}
                    tabIndex={-1}
                    value={moveTarget}
                    onChange={event => setMoveTarget(event.target.value)}
                  >
                    <option value=''>Choose module</option>
                    {targetModules.map(module => (
                      <option key={module.value} value={module.value}>
                        {module.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    type='button'
                    disabled={readOnly || isMovingLesson || !targetModules.some(module => module.value === moveTarget)}
                    isLoading={isMovingLesson}
                    size='sm'
                    onClick={async () => {
                      const ok = await onMoveLesson(moveTarget);
                      if (ok) setMoveTarget('');
                    }}
                  >
                    Move lesson
                  </Button>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>

        {scope === 'organization' && (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <Card className='flex flex-col'>
              <CardHeader>
                <CardTitle icon={<VideoIcon />} iconColor='brand' iconVariant='soft'>
                  Video
                </CardTitle>
                <CardDescription>Upload the video for this lesson.</CardDescription>
              </CardHeader>
              <CardContent className='flex-1'>
                <div className='flex h-full flex-col space-y-4'>
                  {videoUrl ? (
                    <div className='relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-md border bg-black'>
                      <div className='w-full'>
                        <VideoPlayer url={videoUrl} />
                      </div>
                      <div className='absolute top-2 right-2'>
                        <Button
                          className='h-8 w-8 p-0 opacity-70 hover:opacity-100'
                          size='sm'
                          title='Replace Video'
                          variant='secondary'
                          onClick={() => setShowReplaceVideoDialog(true)}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <VideoUpload
                      folder='lesson-videos'
                      lessonId={lesson.id}
                      onUploadComplete={(url: string, videoId: string, file) => {
                        setVideoUrl(url);
                        setVideoGuid(videoId);
                        setVideoFile(file?.name ?? '', file?.size ?? 0);
                        showSuccessToast('Video uploaded');
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className='flex flex-col'>
              <CardHeader>
                <CardTitle icon={<ImageIcon />} iconColor='brand' iconVariant='soft'>
                  Video Thumbnail
                </CardTitle>
                <CardDescription>Replace the auto-generated thumbnail.</CardDescription>
                <CardAction className='self-center'>
                  <Switch
                    id='custom-thumbnail'
                    checked={showCustomThumbnail}
                    onCheckedChange={checked => {
                      setShowCustomThumbnail(checked);
                      if (!checked && videoThumbnailUrl) setVideoThumbnailUrl('');
                    }}
                  />
                </CardAction>
              </CardHeader>
              <CardContent className='flex-1'>
                <div className='flex h-full flex-col space-y-4'>
                  <div className='relative flex aspect-video w-full flex-col'>
                    <AnimatePresence mode='wait'>
                      {showCustomThumbnail ? (
                        <motion.div
                          key='custom'
                          className='absolute inset-0'
                          animate={{ opacity: 1, zIndex: 10 }}
                          exit={{ opacity: 0, zIndex: 0 }}
                          initial={{ opacity: 0, zIndex: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ImageUpload
                            lessonId={lesson.id}
                            scope='lesson-thumbnail'
                            value={videoThumbnailUrl}
                            onChange={(url: string | null) => setVideoThumbnailUrl(url || '')}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key='placeholder'
                          className='absolute inset-0 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-transparent p-6 text-center text-muted-foreground'
                          animate={{ opacity: 1, zIndex: 10 }}
                          exit={{ opacity: 0, zIndex: 0 }}
                          initial={{ opacity: 0, zIndex: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className='text-sm font-medium'>Enable custom thumbnail to upload an image</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {scope === 'platform' && (
          <>
            {videoNotice && videoPending && <p role='alert'>{videoNotice}</p>}
            <LessonVideoEditor
              disabled={readOnly}
              fileName={autosave.values.videoFileName}
              fileSize={autosave.values.videoFileSize}
              lessonId={lesson.id}
              title={title}
              url={videoUrl}
              onChange={(url, videoGuid, file) => {
                autosave.edit({
                  videoUrl: url,
                  videoGuid,
                  videoFileName: file?.name ?? '',
                  videoFileSize: file?.size ?? 0
                });
                setVideoNotice(null);
              }}
              onPendingChange={setVideoPending}
            />
          </>
        )}
      </div>

      {/* Replace Video Confirmation */}
      <ConfirmationDialog
        confirmText='Replace'
        description='This will remove the current video and allow you to upload a new one.'
        open={showReplaceVideoDialog}
        title='Replace Video?'
        variant='default'
        onConfirm={() => {
          setVideoUrl('');
          setVideoGuid('');
          setVideoFile('', 0);
        }}
        onOpenChange={setShowReplaceVideoDialog}
      />
    </>
  );
}
