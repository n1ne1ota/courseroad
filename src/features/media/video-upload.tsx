'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { Body, Meta, UppyFile } from '@uppy/core';

import { showErrorToast, showSuccessToast } from '@courseroad/iota-ui';
import { Button } from '@courseroad/kurume-ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@courseroad/kurume-ui';
import UppyCore from '@uppy/core';
import UppyTus from '@uppy/tus';
import { AlertCircle, CheckCircle2, MoreVertical, Trash2, Upload, Video } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { logs } from '@/lib/logging/client';
import { organizationRequestHeaders } from '@/lib/routes/organization-headers';
import { cn } from '@/lib/utils/cn';
import { generateVideoThumbnail, generateVideoThumbnailBlob } from '@/lib/video/video-thumbnail';

/**
 * Defines the contract for the canonical Bunny.net Media Upload component.
 */
type VideoUploadProps = {
  /** Callback fired upon a successful upload, returning the final HLS Playlist URL (`https://${hostname}/${videoId}/playlist.m3u8`) and the videoId */
  onUploadComplete: (url: string, videoId: string) => void;
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
};

type PresignResponse = {
  videoId: string;
  headers: Record<string, string>;
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
  folder = 'videos',
  maxSizeBytes = 2 * 1024 * 1024 * 1024, // 2GB
  onUploadComplete,
  presignEndpoint = '/api/stream/presign',
  size: _size = 'default'
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
  useEffect(() => {
    onUploadCompleteRef.current = onUploadComplete;
  }, [onUploadComplete]);

  const thumbnailBlobRef = useRef(thumbnailBlob);
  useEffect(() => {
    thumbnailBlobRef.current = thumbnailBlob;
  }, [thumbnailBlob]);

  const uppy = useMemo(
    () =>
      new UppyCore<Meta, Body>({
        autoProceed: false,
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

    // Register Tus plugin
    if (!uppy.getPlugin('Tus')) {
      uppy.use(UppyTus, {
        chunkSize: 10 * 1024 * 1024, // 10MB
        endpoint: 'https://video.bunnycdn.com/tusupload',
        headers: (file: UppyFile<Meta, Body> | undefined) => {
          const tusHeaders = file?.meta?.tusHeaders as Record<string, string> | undefined;
          return tusHeaders ?? {};
        },
        retryDelays: [0, 1000, 3000, 5000]
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
          .then(setThumbnailUrl)
          .catch(err => logs.upload.error('Failed to generate video thumbnail', err));
        // Generate blob for upload
        generateVideoThumbnailBlob(file.data)
          .then(blob => {
            setThumbnailBlob(blob);
          })
          .catch(error => {
            logs.upload.error('Failed to generate thumbnail blob', error);
          });
      }

      void (async () => {
        try {
          const res = await fetch(presignEndpoint, {
            body: JSON.stringify({ title: file.name }),
            headers: { 'Content-Type': 'application/json', ...organizationRequestHeaders() },
            method: 'POST'
          });

          if (!res.ok) throw new Error(`Failed to initialize upload: ${res.status} ${res.statusText}`);

          const data = (await res.json()) as PresignResponse;
          uppy.setFileMeta(file.id, {
            folder,
            tusHeaders: data.headers,
            videoId: data.videoId
          });
          const updatedFile = uppy.getFile(file.id);
          if (updatedFile) setFileInQueue(updatedFile as UppyFile<Meta, Body>);
          setIsPresigned(true);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to initialize upload';
          setUploadError(message);
          showErrorToast(message);
          setIsPresigned(false);
          setFileInQueue(null);
          uppy.removeFile(file.id);
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
        const errorMessage = 'Upload succeeded but no video ID was returned';
        setUploadError(errorMessage);
        showErrorToast(errorMessage);
        setIsUploading(false);
        return;
      }

      const host = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME;
      if (!host) {
        const errorMessage = 'CDN hostname not configured';
        setUploadError(errorMessage);
        showErrorToast(errorMessage);
        setIsUploading(false);
        return;
      }

      const finalUrl = `https://${host}/${videoId}/playlist.m3u8`;

      // Upload thumbnail if we have one
      if (thumbnailBlobRef.current) {
        const formData = new FormData();
        formData.append('file', thumbnailBlobRef.current.blob, thumbnailBlobRef.current.fileName);
        formData.append('videoId', videoId);

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
      onUploadCompleteRef.current(finalUrl, videoId);
      showSuccessToast('Video uploaded successfully!');
      setIsUploading(false);
      setUploadProgress(0);
      // Keep file in queue so user can see what was uploaded
      setIsUploadComplete(true);
    };

    const handleUploadError: UppyEventHandlers['upload-error'] = (_file, error) => {
      const errorMessage = error?.message || 'Upload failed';
      setUploadError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
      showErrorToast(`Upload failed: ${errorMessage}`);
      setIsPresigned(false);
    };

    const handleComplete: UppyEventHandlers['complete'] = () => {
      setIsUploading(false);
    };

    const handleRestrictionFailed: UppyEventHandlers['restriction-failed'] = (_file, error) => {
      showErrorToast(error.message);
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

  // react-dropzone setup
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/webm': ['.webm'],
      'video/x-m4v': ['.m4v'],
      'video/x-matroska': ['.mkv']
    },
    disabled: disabled || isUploading || !!fileInQueue,
    maxFiles: 1,
    maxSize: maxSizeBytes,
    onDrop: acceptedFiles => {
      acceptedFiles.forEach(file => {
        uppy.addFile({
          data: file,
          name: file.name,
          source: 'react-dropzone',
          type: file.type
        });
      });
    },
    onDropRejected: rejections => {
      rejections.forEach(rejection => {
        const error = rejection.errors[0];
        if (error) showErrorToast(error.message);
      });
    }
  });

  const handleUpload = () => {
    if (fileInQueue && !isUploading) {
      const tusHeaders = fileInQueue.meta?.tusHeaders as Record<string, string> | undefined;
      if (!tusHeaders || Object.keys(tusHeaders).length === 0) {
        const errorMessage = 'Upload is still preparing. Please wait a moment and try again.';
        setUploadError(errorMessage);
        showErrorToast(errorMessage);
        return;
      }
      uppy.upload();
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

  return (
    <div className='space-y-3'>
      {/* Error message */}
      {uploadError && (
        <div className='flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          <p>{uploadError}</p>
        </div>
      )}

      {/* Dropzone or File Preview */}
      {!fileInQueue ? (
        <div
          {...getRootProps()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-solid border-border bg-transparent px-6 py-10 transition-all duration-200',
            'aspect-video w-full',
            isDragActive ? 'border-dashed border-primary bg-primary/8' : 'hover:border-primary hover:bg-primary/3',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <input {...getInputProps()} />
          <Video className='mb-4 h-12 w-12 text-muted-foreground' />
          <p className='mb-2 text-center text-sm font-medium text-foreground'>
            {isDragActive ? 'Drop video here' : 'Drop video here or browse files'}
          </p>
          <p className='text-center text-xs text-muted-foreground'>MP4, MOV, MKV, WEBM up to {maxSizeGB} GB</p>
        </div>
      ) : (
        <div className='group relative flex aspect-video w-full flex-col overflow-hidden rounded-lg border border-border bg-black/95'>
          {/* Main Media Preview */}
          <div className='absolute inset-0 flex items-center justify-center p-4'>
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className='h-full w-full object-contain' alt='Video thumbnail' src={thumbnailUrl} />
            ) : (
              <div className='flex flex-col items-center gap-3 text-muted-foreground/50'>
                <div className='rounded-full bg-white/5 p-4 ring-1 ring-white/10'>
                  <Video className='h-8 w-8' />
                </div>
                <p className='text-sm font-medium'>Generating preview</p>
              </div>
            )}
          </div>

          {/* Top Right Status Badge */}
          {isUploadComplete && (
            <div className='absolute top-4 right-4 z-20 animate-in duration-300 fade-in zoom-in'>
              <div className='flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 backdrop-blur-sm'>
                <CheckCircle2 className='h-3.5 w-3.5' />
                Uploaded
              </div>
            </div>
          )}

          {/* Bottom Overlay Bar */}
          <div className='absolute right-0 bottom-0 left-0 z-20 border-t border-white/10 bg-black/60 p-4 backdrop-blur-xl'>
            {isUploading && uploadProgress > 0 ? (
              /* Upload Progress Bar (Replaces Info Bar) */
              <div className='flex h-10 animate-in flex-col justify-center space-y-2 duration-300 fade-in slide-in-from-bottom-2'>
                <div className='flex items-center justify-between text-xs text-white/70'>
                  <span className='flex items-center gap-2'>
                    <div className='h-2 w-2 animate-pulse rounded-full bg-primary' />
                    Uploading <span className='text-white/50'>—</span> {fileInQueue.name}
                  </span>
                  <span className='font-mono'>{uploadProgress}%</span>
                </div>
                <div className='h-1 w-full overflow-hidden rounded-full bg-white/10'>
                  <div
                    className='h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-300 ease-out'
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              /* File Info & Actions */
              <div className='flex h-10 animate-in items-center gap-4 duration-300 fade-in slide-in-from-bottom-2'>
                <div className='min-w-0 flex-1 space-y-0.5'>
                  <p className='truncate text-sm font-medium text-white/90'>{fileInQueue.name}</p>
                  <div className='flex items-center gap-2 text-xs text-white/50'>
                    <span>{((fileInQueue.size ?? 0) / 1024 / 1024).toFixed(2)} MB</span>
                    {!isUploadComplete && !isUploading && (
                      <>
                        <span>•</span>
                        <span className={isPresigned ? 'text-green-400' : 'text-amber-400'}>
                          {isPresigned ? 'Ready to upload' : 'Preparing'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className='flex items-center gap-2'>
                  {!isUploadComplete && !isUploading && (
                    <Button
                      className='h-8 border-white/10 bg-white/10 text-white hover:bg-white/20'
                      type='button'
                      disabled={disabled || !isPresigned}
                      size='sm'
                      variant='secondary'
                      onClick={handleUpload}
                    >
                      <Upload className='mr-2 h-3.5 w-3.5' />
                      Upload
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className='h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white'
                        type='button'
                        disabled={disabled || isUploading}
                        size='icon'
                        variant='ghost'
                      >
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-auto' align='end'>
                      <DropdownMenuItem
                        className='text-destructive focus:bg-destructive/10 focus:text-destructive'
                        onClick={handleClear}
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
