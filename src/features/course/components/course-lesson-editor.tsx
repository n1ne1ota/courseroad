'use client';

import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { showErrorToast, showSuccessToast, Switch } from '@courseroad/iota-ui';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmationDialog,
  Field,
  FieldLabel,
  Input,
  Textarea
} from '@courseroad/kurume-ui';
import { BookOpenIcon, Edit, ImageIcon, VideoIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { useDebounce } from '@/hooks/use-debounce';

import { updateLesson } from '@/features/course/actions/lesson-actions';
import { SaveStatus } from '@/features/course/components/save-status';
import { ImageUpload } from '@/features/media/image-upload';
import { VideoPlayer } from '@/features/media/video-player';
import { VideoUpload } from '@/features/media/video-upload';

import type { Lesson } from '@/features/course/types';

interface CourseLessonEditorProps {
  lesson: Lesson;
  onDelete?: () => void;
  onLessonChange: (lesson: Lesson) => void;
}

export function CourseLessonEditor({
  lesson,
  onDelete: _onDelete,
  onLessonChange
}: CourseLessonEditorProps): JSX.Element {
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description || '');
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || '');
  const [videoGuid, setVideoGuid] = useState(lesson.videoGuid || '');
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState(lesson.videoThumbnailUrl || '');
  const [showCustomThumbnail, setShowCustomThumbnail] = useState(!!lesson.videoThumbnailUrl);

  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  // Separate replace dialog for video
  const [showReplaceVideoDialog, setShowReplaceVideoDialog] = useState(false);

  // Debounce values for autosave
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedDescription = useDebounce(description, 1000);

  // Derive dirty state during render instead of setting state in an effect
  const isSaving = useMemo(() => {
    if (isSavingToServer) return true;
    return (
      title !== lesson.title ||
      description !== (lesson.description || '') ||
      videoUrl !== (lesson.videoUrl || '') ||
      videoGuid !== (lesson.videoGuid || '') ||
      videoThumbnailUrl !== (lesson.videoThumbnailUrl || '')
    );
  }, [title, description, videoUrl, videoGuid, videoThumbnailUrl, lesson, isSavingToServer]);

  // Effect for autosave
  useEffect(() => {
    const save = async () => {
      // Check if changes exist compared to server state
      if (
        debouncedTitle === lesson.title &&
        debouncedDescription === (lesson.description || '') &&
        videoUrl === (lesson.videoUrl || '') &&
        videoGuid === (lesson.videoGuid || '') &&
        videoThumbnailUrl === (lesson.videoThumbnailUrl || '')
      ) {
        // Even if debounced matches, we might need to clear isSaving if we were dirty before but now back to original?
        // But usually if debounced matches, it means we are in sync.
        // However, if we just typed and stopped, debounced matches local state, but lesson prop is old.
        // Wait, debouncedTitle is derived from title with delay.
        return;
      }

      // Debounced values differ from saved lesson prop, persist changes.
      setIsSavingToServer(true);

      try {
        const result = await updateLesson({
          description: debouncedDescription,
          lessonId: lesson.id,
          title: debouncedTitle,
          videoGuid: videoGuid || undefined,
          videoThumbnailUrl: videoThumbnailUrl || undefined,
          videoUrl: videoUrl || undefined
        });

        if (!result.success) {
          showErrorToast(result.error || 'Failed to autosave');
          return;
        }

        // Notify parent to update local state so we don't save again
        onLessonChange({
          ...lesson,
          description: debouncedDescription,
          title: debouncedTitle,
          videoGuid: videoGuid || null,
          videoThumbnailUrl: videoThumbnailUrl || null,
          videoUrl: videoUrl || null
        });

        setLastSaved(new Date());
      } catch {
        showErrorToast('Failed to autosave');
      } finally {
        setIsSavingToServer(false);
      }
    };

    void save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle, debouncedDescription, videoUrl, videoGuid, videoThumbnailUrl]); // Dependencies that trigger save

  // Sync state when switching to a different lesson (keyed on lesson.id)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting local form state when lesson identity changes is intentional prop synchronization
    setTitle(lesson.title);
    setDescription(lesson.description || '');
    setVideoUrl(lesson.videoUrl || '');
    setVideoGuid(lesson.videoGuid || '');
    setVideoThumbnailUrl(lesson.videoThumbnailUrl || '');
    setShowCustomThumbnail(!!lesson.videoThumbnailUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  return (
    <>
      <div className='grid grid-cols-1 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
            <div className='space-y-1'>
              <CardTitle icon={<BookOpenIcon />} iconColor='primary' iconVariant='glow'>
                Lesson Details
              </CardTitle>
              <CardDescription>Basic information about this lesson.</CardDescription>
            </div>
            <div className='pt-1'>
              <SaveStatus lastSavedAt={lastSaved} status={isSaving ? 'saving' : 'saved'} />
            </div>
          </CardHeader>
          <CardContent className='space-y-4 pt-0'>
            <Field>
              <FieldLabel htmlFor='title'>Title</FieldLabel>
              <Input id='title' value={title} onChange={e => setTitle(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor='description'>Description</FieldLabel>
              <Textarea
                className='min-h-30'
                id='description'
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </Field>
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <Card className='flex flex-col'>
            <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
              <div className='space-y-1'>
                <CardTitle icon={<VideoIcon />} iconColor='primary' iconVariant='glow'>
                  Video
                </CardTitle>
                <CardDescription>Upload the video for this lesson.</CardDescription>
              </div>
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
                    onUploadComplete={(url: string, videoId: string) => {
                      setVideoUrl(url);
                      setVideoGuid(videoId);
                      showSuccessToast('Video uploaded');
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className='flex flex-col'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='space-y-1'>
                <CardTitle icon={<ImageIcon />} iconColor='primary' iconVariant='glow'>
                  Video Thumbnail
                </CardTitle>
                <CardDescription>Replace the auto-generated thumbnail.</CardDescription>
              </div>
              <Switch
                id='custom-thumbnail'
                checked={showCustomThumbnail}
                onCheckedChange={checked => {
                  setShowCustomThumbnail(checked);
                  if (!checked && videoThumbnailUrl) setVideoThumbnailUrl('');
                }}
              />
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
        }}
        onOpenChange={setShowReplaceVideoDialog}
      />
    </>
  );
}
