'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { Body, Meta, UppyFile } from '@uppy/core';

import {
  Button,
  ConfirmationDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FileDropzone,
  FilePreview,
  showSuccessToast
} from '@courseroad/kurume-ui';

import UppyCore from '@uppy/core';
import UppyTus from '@uppy/tus';
import { MoreVertical, Trash2, Upload, Video } from 'lucide-react';

import { logs } from '@/lib/logging/client';
import { generateVideoThumbnail, generateVideoThumbnailBlob } from '@/lib/video/video-thumbnail';

import { VideoPlayer } from '@/features/media/components/video-player';
import { mediaUploadContext } from '@/features/media/lib/media-context';
import { organizationRequestHeaders } from '@/features/media/lib/organization-headers';
import { httpStatusMessage, tusErrorMessage } from '@/features/media/lib/upload-errors';

/**
 * Defines the contract for the canonical Bunny.net Media Upload component.
 */
type VideoUploadProps = {
  /** Callback fired upon a successful upload, returning the final HLS Playlist URL (`https://${hostname}/${videoId}/playlist.m3u8`) and the videoId */
  onUploadComplete: (url: string, videoId: string, file?: { name: string; size: number }) => void;
  /** Queued or uploading video work that has not completed. */
  onPendingChange?: ((pending: boolean) => void) | undefined;
  /** Disables the entire uploader interaction if true */
  disabled?: boolean;
  /** Maximum allowed file size in bytes (defaults to 2GB) */
  maxSizeBytes?: number;
  /** Folder path metadata that will be stored along with the video on Bunny.net */
  folder?: string;
  /**
   * The relative API endpoint used to generate an upload `videoId` and TUS headers.
   * Required Response shape: `{ videoId: string, headers: Record<string, string>, endpoint?: string }`
   */
  presignEndpoint?: string;
  /** Configures layout density of the uploader */
  size?: 'compact' | 'default';
  /**
   * The saved video's HLS URL. When this prop is provided the uploader is controlled: an empty value shows the
   * dropzone, a set value shows the attached video, and a finished upload hands over to the new value.
   */
  value?: string | null | undefined;
  /** Name shown for the saved video. */
  title?: string | undefined;
  /** The saved video's original file name and size in bytes, shown in the bar. Empty and 0 mean unknown. */
  fileName?: string | null | undefined;
  fileSize?: number | null | undefined;
  /** Called after the user confirms removing the saved video. Remove is hidden without it. */
  onRemove?: (() => void) | undefined;
  /**
   * The lesson this video belongs to. Leave it out for a course intro video. The course comes from the page URL.
   * The server checks both against the signed-in user before using them to file the video.
   */
  lessonId?: string | undefined;
};

type PresignResponse = {
  videoId: string;
  headers: Record<string, string>;
};

/**
 * Every presign creates a brand-new Bunny video with its own signed headers, so an upload must never resume a
 * previous one. tus-js-client otherwise matches the file's fingerprint in localStorage and reattaches to the old,
 * already-complete upload URL: it reports success without sending any bytes, and the new video stays "Created".
 */
const noResumeUrlStorage = {
  addUpload: async () => '',
  findAllUploads: async () => [],
  findUploadsByFingerprint: async () => [],
  removeUpload: async () => {}
};

type UppyUploadProgress = {
  bytesUploaded: number;
  bytesTotal: number | null;
};

type UppyEventHandlers = {
  'file-added': (file: UppyFile<Meta, Body>) => void;
  'file-removed': (file: UppyFile<Meta, Body> | undefined) => void;
  upload: () => void;
  'upload-progress': (file: UppyFile<Meta, Body> | undefined, progress: UppyUploadProgress) => void;
  'upload-success': (file: UppyFile<Meta, Body> | undefined) => void;
  'upload-error': (file: UppyFile<Meta, Body> | undefined, error: Error, response?: unknown) => void;
  complete: (result: unknown) => void;
  'restriction-failed': (file: UppyFile<Meta, Body> | undefined, error: Error) => void;
};

/**
 * Canonical Bunny.net Direct Video Uploader.
 * Uses `@uppy/tus` to stream large media files directly to the Bunny edge rather than proxying through Next.js.
 * Capable of automatically generating a thumbnail via Canvas extraction before upload.
 *
 * **Supported Files:** `video/mp4`, `video/quicktime`, `video/x-matroska`, `video/webm`, `video/x-m4v`
 *
 * @example
 * <VideoUpload
 *    onUploadComplete={(url) => setVideoUrl(url)}
 *    presignEndpoint="/api/stream/presign"
 *    folder="course-details"
 * />
 */
export function VideoUpload({
  disabled,
  fileName,
  fileSize,
  folder = 'videos',
  maxSizeBytes = 2 * 1024 * 1024 * 1024, // 2GB
  onUploadComplete,
  onPendingChange,
  lessonId,
  onRemove,
  presignEndpoint = '/api/stream/presign',
  size: _size = 'default',
  title,
  value
}: VideoUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileInQueue, setFileInQueue] = useState<UppyFile<Meta, Body> | null>(null);
  const [isPresigned, setIsPresigned] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<{
    blob: Blob;
    fileName: string;
    fileSize: number;
  } | null>(null);

  // Use refs to avoid re-running the effect when these values change
  const onUploadCompleteRef = useRef(onUploadComplete);
  const onPendingChangeRef = useRef(onPendingChange);
  useEffect(() => {
    onPendingChangeRef.current = onPendingChange;
  }, [onPendingChange]);
  useEffect(() => {
    onPendingChangeRef.current?.(!!fileInQueue && !isUploadComplete);
  }, [fileInQueue, isUploadComplete]);
  useEffect(() => () => onPendingChangeRef.current?.(false), []);
  useEffect(() => {
    onUploadCompleteRef.current = onUploadComplete;
  }, [onUploadComplete]);

  const [removing, setRemoving] = useState(false);

  // Controlled hosts own the saved video, so a finished upload clears its queue and hands over to `value`.
  const lessonIdRef = useRef(lessonId);
  useEffect(() => {
    lessonIdRef.current = lessonId;
  }, [lessonId]);
  const controlledRef = useRef(value !== undefined);
  useEffect(() => {
    controlledRef.current = value !== undefined;
  }, [value]);

  const thumbnailBlobRef = useRef(thumbnailBlob);
  useEffect(() => {
    thumbnailBlobRef.current = thumbnailBlob;
  }, [thumbnailBlob]);

  const uppy = useMemo(
    () =>
      new UppyCore<Meta, Body>({
        autoProceed: false,
        logger: {
          debug: () => {},
          warn: (message: unknown) => logs.upload.warn('Video uploader', { message: String(message) }),
          error: (message: unknown) => logs.upload.warn('Video upload attempt failed', { message: String(message) })
        },
        restrictions: {
          allowedFileTypes: ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm', 'video/x-m4v'],
          maxFileSize: maxSizeBytes,
          maxNumberOfFiles: 1
        }
      }),
    [maxSizeBytes]
  );

  useEffect(() => {
    type UppyEventBridge<U> = {
      on<Event extends keyof UppyEventHandlers>(event: Event, handler: UppyEventHandlers[Event]): U;
      off<Event extends keyof UppyEventHandlers>(event: Event, handler: UppyEventHandlers[Event]): U;
    };

    const typedUppy = uppy as typeof uppy & UppyEventBridge<typeof uppy>;
    let active = true;

    // Register Tus plugin
    if (!uppy.getPlugin('Tus')) {
      uppy.use(UppyTus, {
        chunkSize: 10 * 1024 * 1024, // 10MB
        endpoint: 'https://video.bunnycdn.com/tusupload',
        headers: (file: UppyFile<Meta, Body> | undefined) => {
          const tusHeaders = file?.meta?.tusHeaders as Record<string, string> | undefined;
          return tusHeaders ?? {};
        },
        retryDelays: [0, 1000, 3000, 5000],
        urlStorage: noResumeUrlStorage
      });
    }

    // Event handlers
    const handleFileAdded: UppyEventHandlers['file-added'] = file => {
      setUploadError(null);
      setUploadProgress(0);
      setFileInQueue(file);
      setIsPresigned(false);
      setIsUploadComplete(false);
      setThumbnailBlob(null);
      setThumbnailUrl(null);

      // Generate thumbnail for preview and blob for upload
      if (file.data instanceof File) {
        // Generate preview thumbnail
        generateVideoThumbnail(file.data)
          .then(url => {
            if (active && uppy.getFile(file.id)) setThumbnailUrl(url);
          })
          .catch(err => {
            if (active && uppy.getFile(file.id)) logs.upload.warn('Failed to generate video thumbnail', err);
          });
        // Generate blob for upload
        generateVideoThumbnailBlob(file.data)
          .then(blob => {
            if (active && uppy.getFile(file.id)) setThumbnailBlob(blob);
          })
          .catch(error => {
            if (active && uppy.getFile(file.id)) logs.upload.warn('Failed to generate thumbnail blob', error);
          });
      }

      void (async () => {
        try {
          const res = await fetch(presignEndpoint, {
            body: JSON.stringify({ title: file.name, ...mediaUploadContext({ lessonId: lessonIdRef.current }) }),
            headers: { 'Content-Type': 'application/json', ...organizationRequestHeaders() },
            method: 'POST'
          });

          // A proxy or framework 404 can return HTML, so a non-JSON body must not mask the status.
          const data = (await res.json().catch(() => ({}))) as Partial<PresignResponse> & { error?: string };
          if (!active || !uppy.getFile(file.id)) return;
          if (!res.ok) throw new Error(httpStatusMessage(res.status, data.error));
          if (!data.videoId || !data.headers) throw new Error('Incomplete upload response.');
          uppy.setFileMeta(file.id, {
            folder,
            tusHeaders: data.headers,
            videoId: data.videoId
          });
          const updatedFile = uppy.getFile(file.id);
          if (updatedFile) setFileInQueue(updatedFile as UppyFile<Meta, Body>);
          setIsPresigned(true);
        } catch (error) {
          if (!active || !uppy.getFile(file.id)) return;
          const message = error instanceof Error ? error.message : 'Failed to initialize upload';
          logs.upload.warn('Video upload initialization failed', { message });
          setIsPresigned(false);
          setFileInQueue(null);
          uppy.removeFile(file.id);
          setUploadError(message);
        }
      })();
    };

    const handleFileRemoved: UppyEventHandlers['file-removed'] = () => {
      const files = uppy.getFiles();
      if (files.length === 0) {
        setFileInQueue(null);
        setIsPresigned(false);
        setIsUploadComplete(false);
        setThumbnailBlob(null);
        setThumbnailUrl(null);
      }
      setUploadProgress(0);
      setUploadError(null);
    };

    const handleUploadStart: UppyEventHandlers['upload'] = () => {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);
    };

    const handleUploadProgress: UppyEventHandlers['upload-progress'] = (_file, progress) => {
      if (progress.bytesTotal && progress.bytesTotal > 0) {
        const percentage = Math.round((progress.bytesUploaded / progress.bytesTotal) * 100);
        setUploadProgress(percentage);
      }
    };

    const handleUploadSuccess: UppyEventHandlers['upload-success'] = file => {
      const videoId = file?.meta?.videoId as string | undefined;

      if (!videoId) {
        const errorMessage = 'No video ID returned.';
        setUploadError(errorMessage);
        setIsUploading(false);
        return;
      }

      const host = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME;
      if (!host) {
        const errorMessage = 'CDN hostname not configured';
        setUploadError(errorMessage);
        setIsUploading(false);
        return;
      }

      const finalUrl = `https://${host}/${videoId}/playlist.m3u8`;

      // Upload thumbnail if we have one
      if (thumbnailBlobRef.current) {
        const formData = new FormData();
        formData.append('file', thumbnailBlobRef.current.blob, thumbnailBlobRef.current.fileName);
        formData.append('videoId', videoId);
        Object.entries(mediaUploadContext({ lessonId: lessonIdRef.current })).forEach(([key, id]) =>
          formData.append(key, id)
        );

        fetch('/api/storage/video-thumbnails', {
          headers: organizationRequestHeaders(),
          body: formData,
          method: 'POST'
        })
          .then(res => {
            return res.json();
          })
          .then(data => {
            if (data.url) {
              // You can store this URL if needed
            } else if (data.error) {
              logs.upload.error('Thumbnail upload failed', data.error);
            }
          })
          .catch(error => {
            logs.upload.error('Thumbnail upload request failed', error);
            // Don't fail the whole upload if thumbnail fails
          });
      } else {
        logs.upload.warn('No thumbnail blob available for upload');
      }

      // Use the ref here
      // The size can exceed a 32-bit column only by one byte at the 2 GB limit, so clamp it for storage.
      onUploadCompleteRef.current(finalUrl, videoId, {
        name: file?.name ?? '',
        size: Math.min(file?.size ?? 0, 2_147_483_647)
      });
      showSuccessToast('Video uploaded successfully!');
      setIsUploading(false);
      setUploadProgress(0);
      if (controlledRef.current) {
        // The saved video takes over; removing the file resets the queue through the file-removed handler.
        queueMicrotask(() => uppy.getFiles().forEach(queued => uppy.removeFile(queued.id)));
      } else {
        // Keep file in queue so user can see what was uploaded
        setIsUploadComplete(true);
      }
    };

    const handleUploadError: UppyEventHandlers['upload-error'] = (_file, error) => {
      setUploadError(tusErrorMessage(error ?? {}));
      setIsUploading(false);
      setUploadProgress(0);
      // Retain the signed session so the queued transfer can be retried.
    };

    const handleComplete: UppyEventHandlers['complete'] = () => {
      setIsUploading(false);
    };

    const handleRestrictionFailed: UppyEventHandlers['restriction-failed'] = (_file, error) => {
      setUploadError(error.message);
    };

    // Register event listeners
    typedUppy.on('file-added', handleFileAdded);
    typedUppy.on('file-removed', handleFileRemoved);
    typedUppy.on('upload', handleUploadStart);
    typedUppy.on('upload-progress', handleUploadProgress);
    typedUppy.on('upload-success', handleUploadSuccess);
    typedUppy.on('upload-error', handleUploadError);
    typedUppy.on('complete', handleComplete);
    typedUppy.on('restriction-failed', handleRestrictionFailed);

    // Cleanup
    return () => {
      active = false;
      typedUppy.off('file-added', handleFileAdded);
      typedUppy.off('file-removed', handleFileRemoved);
      typedUppy.off('upload', handleUploadStart);
      typedUppy.off('upload-progress', handleUploadProgress);
      typedUppy.off('upload-success', handleUploadSuccess);
      typedUppy.off('upload-error', handleUploadError);
      typedUppy.off('complete', handleComplete);
      typedUppy.off('restriction-failed', handleRestrictionFailed);
      uppy.cancelAll();
      setIsPresigned(false);
    };
  }, [folder, presignEndpoint, uppy]); // Removed onUploadComplete from deps

  const handleUpload = () => {
    if (fileInQueue && !isUploading) {
      const tusHeaders = fileInQueue.meta?.tusHeaders as Record<string, string> | undefined;
      if (!tusHeaders || Object.keys(tusHeaders).length === 0) {
        const errorMessage = 'Still preparing. Try again shortly.';
        setUploadError(errorMessage);
        return;
      }
      if (uppy.getFile(fileInQueue.id)?.error) void uppy.retryAll();
      else void uppy.upload();
    }
  };

  const handleClear = () => {
    uppy.cancelAll();
    uppy.getFiles().forEach(file => uppy.removeFile(file.id));
    setFileInQueue(null);
    setUploadProgress(0);
    setUploadError(null);
    setIsPresigned(false);
    setIsUploadComplete(false);
    setThumbnailBlob(null);
    setThumbnailUrl(null);
  };

  const maxSizeGB = (maxSizeBytes / (1024 * 1024 * 1024)).toFixed(0);
  const actionsLocked = disabled || isUploading;

  return (
    <div className='space-y-3'>
      {/* Queued file, saved video, or dropzone. Errors render inside each, so the card never changes height. */}
      {fileInQueue ? (
        <FilePreview
          name={fileInQueue.name}
          actions={
            <>
              {!isUploadComplete && !isUploading && (
                <Button
                  type='button'
                  disabled={disabled || !isPresigned}
                  size='sm'
                  variant='outline'
                  onClick={handleUpload}
                >
                  <Upload aria-hidden='true' />
                  {uploadError ? 'Retry' : 'Upload'}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type='button'
                      disabled={actionsLocked}
                      size='icon-sm'
                      variant='outline'
                      aria-label='Video actions'
                    />
                  }
                  disabled={actionsLocked}
                >
                  <MoreVertical aria-hidden='true' />
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-auto' positionerProps={{ align: 'end' }}>
                  <DropdownMenuItem disabled={actionsLocked} variant='destructive' onClick={handleClear}>
                    <Trash2 aria-hidden='true' />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
          error={uploadError}
          meta={`${((fileInQueue.size ?? 0) / 1024 / 1024).toFixed(2)} MB`}
          progress={isUploading && uploadProgress > 0 ? uploadProgress : null}
          progressIndeterminate={isUploading}
          progressLabel={`Uploading ${fileInQueue.name}`}
          status={!isUploadComplete && !isUploading ? (isPresigned ? 'Ready to upload' : 'Preparing') : undefined}
          statusTone={isPresigned ? 'success' : 'warning'}
          uploaded={isUploadComplete}
        >
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className='h-full w-full object-contain' alt='Video thumbnail' src={thumbnailUrl} />
          ) : (
            <Video className='h-10 w-10 text-white/40' aria-hidden='true' />
          )}
        </FilePreview>
      ) : value ? (
        <>
          <FilePreview
            name={fileName || title || 'Video'}
            uploaded
            actions={
              onRemove && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type='button'
                        disabled={disabled}
                        size='icon-sm'
                        variant='outline'
                        aria-label='Video actions'
                      />
                    }
                    disabled={disabled}
                  >
                    <MoreVertical aria-hidden='true' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-auto' positionerProps={{ align: 'end' }}>
                    <DropdownMenuItem disabled={disabled} variant='destructive' onClick={() => setRemoving(true)}>
                      <Trash2 aria-hidden='true' />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }
            meta={fileSize ? `${(fileSize / 1024 / 1024).toFixed(2)} MB` : undefined}
          >
            {/* The card already clips and rounds its corners, so the player's own rounding would double up. */}
            <VideoPlayer className='rounded-none' title={title} url={value} />
          </FilePreview>
          <ConfirmationDialog
            confirmText='Remove'
            description='This video will no longer be used here.'
            open={removing}
            title='Remove video?'
            variant='destructive'
            onConfirm={() => {
              if (!disabled) onRemove?.();
            }}
            onOpenChange={setRemoving}
          />
        </>
      ) : (
        <FileDropzone
          accept={{
            'video/mp4': ['.mp4'],
            'video/quicktime': ['.mov'],
            'video/webm': ['.webm'],
            'video/x-m4v': ['.m4v'],
            'video/x-matroska': ['.mkv']
          }}
          activeTitle='Drop video here'
          aspect='video'
          disabled={disabled || isUploading}
          error={uploadError}
          fileTypeLabel='MP4, MOV, MKV, WEBM, or M4V'
          hint={`MP4, MOV, MKV, WEBM up to ${maxSizeGB} GB`}
          icon={<Video />}
          inputLabel='Choose a video'
          maxSize={maxSizeBytes}
          title='Drop video here or browse files'
          onErrorDismiss={() => setUploadError(null)}
          onFilesAccepted={files => {
            files.forEach(file => {
              try {
                uppy.addFile({ data: file, name: file.name, source: 'react-dropzone', type: file.type });
              } catch (error) {
                // Uppy restriction errors also arrive through restriction-failed; others are surfaced here.
                if (!uppy.getFiles().length)
                  setUploadError(error instanceof Error ? error.message : 'Could not add this file.');
              }
            });
          }}
        />
      )}
    </div>
  );
}
