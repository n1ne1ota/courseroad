'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@courseroad/kurume-ui';

import { VideoIcon } from 'lucide-react';

import { VideoUpload } from '@/features/media/components/video-upload';

type LessonVideoEditorProps = {
  lessonId: string;
  url: string;
  /** Display details of the saved video. Empty and 0 mean unknown. */
  fileName: string;
  fileSize: number;
  title: string;
  disabled: boolean;
  onChange: (url: string, videoGuid: string, file?: { name: string; size: number }) => void;
  onPendingChange: (pending: boolean) => void;
};

/** The lesson's video card: a dropzone until a video is attached, then the video with its actions. */
export function LessonVideoEditor({
  fileName,
  fileSize,
  lessonId,
  url,
  title,
  disabled,
  onChange,
  onPendingChange
}: LessonVideoEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle icon={<VideoIcon />} iconColor='brand' iconVariant='soft'>
          Lesson Video
        </CardTitle>
        <CardDescription>Upload a lesson video. Successful uploads are saved automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        <VideoUpload
          disabled={disabled}
          fileName={fileName}
          fileSize={fileSize}
          folder='lesson-videos'
          lessonId={lessonId}
          title={title}
          value={url}
          onPendingChange={onPendingChange}
          onRemove={() => onChange('', '')}
          onUploadComplete={onChange}
        />
      </CardContent>
    </Card>
  );
}
