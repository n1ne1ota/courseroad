'use client';
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';

import Image from 'next/image';

import type { Meta, UppyEventMap, UppyFile } from '@uppy/core';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FileDropzone,
  FilePreview,
  ImageCropperDialog,
  ImageEditorDialog,
  showSuccessToast
} from '@courseroad/kurume-ui';

import UppyCompressor from '@uppy/compressor';
import UppyCore from '@uppy/core';
import UppyXHRUpload from '@uppy/xhr-upload';
import { Edit, ImageIcon, MoreVertical, Trash2, Upload } from 'lucide-react';

import type { ImageUploadScope } from '@/lib/constants/image-upload';
import { logs } from '@/lib/logging/client';

import { mediaUploadContext } from '@/features/media/lib/media-context';
import { organizationRequestHeaders } from '@/features/media/lib/organization-headers';
import { uploadErrorMessage } from '@/features/media/lib/upload-errors';

type ImageUploadProps = {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  fileName?: string;
  fileSize?: number;
  scope?: ImageUploadScope;
  /** The lesson a lesson thumbnail belongs to. Course and quiz come from the page URL; the server verifies all IDs. */
  lessonId?: string;
};

type UploadResponse = {
  url?: string;
  error?: string;
};

/** Editor output is already encoded at the user's chosen quality and format. */
class ImageUploadCompressor extends UppyCompressor<Meta, UploadResponse> {
  override prepareUpload(fileIDs: string[]) {
    return super.prepareUpload(
      fileIDs.filter(id => !['image-editor', 'image-cropper'].includes(this.uppy.getFile(id)?.source ?? ''))
    );
  }
}

type UppyEventHandlers = UppyEventMap<Meta, UploadResponse>;

function normalizeImageUrl(src: string) {
  if (!src || src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('/')) return src;
  try {
    new URL(src);
    return src;
  } catch {
    return `https://${src}`;
  }
}

const getDerivedFileName = (initialFileName?: string, value?: string | null) => {
  if (initialFileName) return initialFileName;
  if (!value) return undefined;

  try {
    const urlStr = value.startsWith('http') ? value : `https://${value}`;
    const urlObj = new URL(urlStr);
    const pathSegments = urlObj.pathname.split('/');
    const extractedName = pathSegments[pathSegments.length - 1];

    return extractedName
      ? extractedName.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/, '')
      : 'image.webp';
  } catch {
    return 'image.webp';
  }
};

export function ImageUpload({
  disabled,
  fileName: initialFileName,
  fileSize: initialFileSize,
  lessonId,
  onChange,
  scope = 'course-cover',
  value
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileInQueue, setFileInQueue] = useState<UppyFile<Meta, UploadResponse> | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<{ src: string; fileName: string } | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [fetchedFileSize, setFetchedFileSize] = useState<{ size: number; url: string } | null>(null);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const preparationRef = useRef<AbortController | null>(null);
  const objectUrls = useRef<{ preview: string | null; editor: string | null }>({ preview: null, editor: null });
  const replacingFile = useRef(false);
  const actionsRef = useRef<HTMLButtonElement>(null);
  const dropzoneWrapperRef = useRef<HTMLDivElement>(null);
  const cropThumbnail = ['course-cover', 'lesson-thumbnail', 'quiz-thumbnail'].includes(scope);
  const actionsDisabled = disabled || isUploading || isPreparingImage;
  const selectionState = useRef({ active: true, scope, value, disabled, blocked: false });
  useEffect(() => {
    selectionState.current = {
      active: true,
      scope,
      value,
      disabled,
      blocked: !!(isUploading || isPreparingImage || editorOpen || editingFile || fileInQueue || value)
    };
    return () => {
      selectionState.current.active = false;
    };
  }, [scope, value, disabled, isUploading, isPreparingImage, editorOpen, editingFile, fileInQueue]);
  const derivedFileName = useMemo(() => getDerivedFileName(initialFileName, value), [initialFileName, value]);
  const fetchedSizeForValue = fetchedFileSize?.url === value ? fetchedFileSize?.size : null;
  const displayFileSize = fileInQueue?.size ?? initialFileSize ?? fetchedSizeForValue ?? null;

  // Each object URL has one owner, including the temporary source for a saved image.
  const releaseObjectUrl = useCallback((owner: 'preview' | 'editor') => {
    const url = objectUrls.current[owner];
    if (url) URL.revokeObjectURL(url);
    objectUrls.current[owner] = null;
  }, []);

  const replaceObjectUrl = useCallback(
    (owner: 'preview' | 'editor', blob: Blob) => {
      const url = URL.createObjectURL(blob);
      releaseObjectUrl(owner);
      objectUrls.current[owner] = url;
      return url;
    },
    [releaseObjectUrl]
  );

  const closeEditor = useCallback(
    (restoreFocus = true) => {
      preparationRef.current?.abort();
      preparationRef.current = null;
      setIsPreparingImage(false);
      setEditorOpen(false);
      if (!restoreFocus) {
        setEditingFile(null);
        releaseObjectUrl('editor');
      }
    },
    [releaseObjectUrl]
  );

  useEffect(() => () => closeEditor(false), [value, scope, disabled, closeEditor]);

  useEffect(() => {
    const controller = new AbortController();
    if (value && !initialFileSize && !fileInQueue) {
      fetch(normalizeImageUrl(value), { method: 'HEAD', signal: controller.signal })
        .then(res => {
          const size = res.headers.get('Content-Length');
          if (size) setFetchedFileSize({ size: parseInt(size, 10), url: value });
        })
        .catch(err => {
          if (!controller.signal.aborted) logs.upload.warn('Failed to get file size', err);
        });
    }
    return () => controller.abort();
  }, [value, initialFileSize, fileInQueue]);

  const uppy = useMemo(
    () =>
      new UppyCore<Meta, UploadResponse>({
        autoProceed: false,
        logger: {
          debug: () => {},
          warn: (message: unknown) => logs.upload.warn('Image uploader', { message: String(message) }),
          error: (message: unknown) => logs.upload.warn('Image upload attempt failed', { message: String(message) })
        },
        restrictions: {
          allowedFileTypes: ['image/png', 'image/jpeg', 'image/webp'],
          maxFileSize: 10 * 1024 * 1024,
          maxNumberOfFiles: 1
        }
      }),
    []
  );

  useEffect(
    () => () => {
      uppy.cancelAll();
      releaseObjectUrl('preview');
      releaseObjectUrl('editor');
    },
    [uppy, releaseObjectUrl]
  );

  const updateQueuedFile = useCallback(
    (file: UppyFile<Meta, UploadResponse>) => {
      // Uppy sends every allowed meta field and writes the text "undefined" for one that is not set, so set all of
      // them. An empty string means "no such context" to the server.
      uppy.setFileMeta(file.id, { scope, courseId: '', lessonId: '', quizId: '', ...mediaUploadContext({ lessonId }) });
      setFileInQueue(uppy.getFile(file.id) ?? file);
      setUploadError(null);
      setUploadProgress(0);
      setIsUploadComplete(false);
      if (file.data instanceof Blob) setPreviewUrl(replaceObjectUrl('preview', file.data));
    },
    [uppy, scope, lessonId, replaceObjectUrl]
  );

  const notifyUploadSuccess = useEffectEvent((url: string) => {
    onChange(url);
    showSuccessToast('Image uploaded successfully!');
    setIsUploadComplete(true);
  });

  useEffect(() => {
    // Register plugins
    if (!uppy.getPlugin('Compressor')) {
      uppy.use(ImageUploadCompressor, {
        mimeType: 'image/webp',
        quality: 0.85
      });
    }

    if (!uppy.getPlugin('XHRUpload')) {
      uppy.use(UppyXHRUpload, {
        allowedMetaFields: ['scope', 'courseId', 'lessonId', 'quizId'],
        endpoint: '/api/storage/images',
        headers: () => organizationRequestHeaders(),
        fieldName: 'file',
        formData: true,
        shouldRetry: xhr => xhr.status === 0 || xhr.status === 408 || xhr.status === 429 || xhr.status >= 500,
        getResponseData: (xhr: XMLHttpRequest) => {
          try {
            return JSON.parse(xhr.responseText);
          } catch {
            return {};
          }
        }
      });
    }

    // Event handlers
    const handleFileAdded: UppyEventHandlers['file-added'] = file => {
      if (!replacingFile.current) updateQueuedFile(file);
    };

    const handleFileRemoved: UppyEventHandlers['file-removed'] = _file => {
      if (replacingFile.current) return;
      const files = uppy.getFiles();
      if (files.length === 0) {
        setFileInQueue(null);
        releaseObjectUrl('preview');
        setPreviewUrl(null);
      }
      setUploadProgress(0);
      setIsUploadComplete(false);
    };

    const handleUploadStart: UppyEventHandlers['upload'] = () => {
      setUploadError(null);
      setIsUploading(true);
      setUploadProgress(0);
    };

    const handleUploadProgress: UppyEventHandlers['upload-progress'] = (_file, progress) => {
      if (progress.bytesTotal && progress.bytesTotal > 0) {
        const percentage = Math.round((progress.bytesUploaded / progress.bytesTotal) * 100);
        setUploadProgress(percentage);
      }
    };

    const handleUploadSuccess: UppyEventHandlers['upload-success'] = (_file, response) => {
      const url = response?.body?.url;
      if (url) {
        notifyUploadSuccess(url);
      } else {
        setUploadError('Upload succeeded but no URL was returned');
        setIsUploading(false);
      }
    };

    const handleUploadError: UppyEventHandlers['upload-error'] = (_file, error, response) => {
      const errorMessage = uploadErrorMessage(error, response);
      setUploadError(errorMessage);
      setIsUploading(false);
    };

    const handleComplete: UppyEventHandlers['complete'] = () => {
      setIsUploading(false);
      setUploadProgress(0);
    };

    const handleRestrictionFailed: UppyEventHandlers['restriction-failed'] = (_file, error) => {
      setUploadError(error.message);
    };

    // Register event listeners
    uppy.on('file-added', handleFileAdded);
    uppy.on('file-removed', handleFileRemoved);
    uppy.on('upload', handleUploadStart);
    uppy.on('upload-progress', handleUploadProgress);
    uppy.on('upload-success', handleUploadSuccess);
    uppy.on('upload-error', handleUploadError);
    uppy.on('complete', handleComplete);
    uppy.on('restriction-failed', handleRestrictionFailed);

    // Cleanup
    return () => {
      uppy.off('file-added', handleFileAdded);
      uppy.off('file-removed', handleFileRemoved);
      uppy.off('upload', handleUploadStart);
      uppy.off('upload-progress', handleUploadProgress);
      uppy.off('upload-success', handleUploadSuccess);
      uppy.off('upload-error', handleUploadError);
      uppy.off('complete', handleComplete);
      uppy.off('restriction-failed', handleRestrictionFailed);
      // Don't cancel uploads on cleanup, only on unmount
      // uppy.cancelAll();
    };
  }, [uppy, updateQueuedFile, releaseObjectUrl]);

  const dropDisabled = actionsDisabled || editorOpen || !!editingFile || !!value || !!fileInQueue;

  const handleFilesAccepted = (acceptedFiles: File[]) => {
    const current = selectionState.current;
    // File selection can finish asynchronously after the drop target changes or unmounts.
    if (!current.active || current.disabled || current.blocked || current.scope !== scope || current.value !== value)
      return;
    if (cropThumbnail) {
      const file = acceptedFiles[0];
      if (!file) return;
      setUploadError(null);
      setEditingFile({ fileName: file.name, src: replaceObjectUrl('editor', file) });
      setEditorOpen(true);
      return;
    }
    acceptedFiles.forEach(file => {
      uppy.addFile({
        data: file,
        name: file.name,
        source: 'react-dropzone',
        type: file.type
      });
    });
  };

  const handleUpload = () => {
    if (fileInQueue && !actionsDisabled && !editorOpen) void uppy.upload();
  };

  const handleClear = () => {
    if (actionsDisabled) return;
    closeEditor(false);
    setUploadError(null);
    uppy.cancelAll();
    uppy.getFiles().forEach(file => uppy.removeFile(file.id));
    onChange(null);
    setFileInQueue(null);
    setUploadProgress(0);
    setIsUploadComplete(false);
    releaseObjectUrl('preview');
    setPreviewUrl(null);
  };

  const handleEdit = async () => {
    if (actionsDisabled || editorOpen || preparationRef.current) return;
    setUploadError(null);
    if (fileInQueue && previewUrl) {
      setEditingFile({ fileName: fileInQueue.name || 'image.webp', src: previewUrl });
      setEditorOpen(true);
      return;
    }
    if (!value) return;

    const controller = new AbortController();
    preparationRef.current = controller;
    setIsPreparingImage(true);
    try {
      const response = await fetch(normalizeImageUrl(value), { signal: controller.signal });
      if (!response.ok) throw new Error('Could not load the image.');
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      if (!blob.size || !['image/png', 'image/jpeg', 'image/webp'].includes(blob.type)) {
        throw new Error('Use a PNG, JPG, or WEBP image.');
      }
      setEditingFile({ fileName: derivedFileName || 'image.webp', src: replaceObjectUrl('editor', blob) });
      setEditorOpen(true);
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : 'Could not load the image.';
      setUploadError(message);
      requestAnimationFrame(() => actionsRef.current?.focus());
    } finally {
      if (preparationRef.current === controller) {
        preparationRef.current = null;
        setIsPreparingImage(false);
      }
    }
  };

  const handleEditorSave = (blob: Blob, fileName: string) => {
    if (actionsDisabled) return false;
    const type = blob.type;
    const extension =
      type === 'image/jpeg' ? 'jpg' : type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : null;
    if (!extension) throw new Error('Choose a PNG, JPEG, or WebP export.');
    const name = `${fileName.replace(/\.[^.]+$/, '') || 'image'}.${extension}`;
    const restriction = uppy.validateRestrictions({ name, type, size: blob.size, extension }, []);
    if (!blob.size || restriction) {
      const message = restriction?.message || 'The edited image is empty.';
      setUploadError(message);
      throw new Error(message);
    }

    const previousFiles = uppy.getState().files;
    replacingFile.current = true;
    try {
      if (fileInQueue) uppy.removeFile(fileInQueue.id);
      const id = uppy.addFile({ data: blob, name, source: cropThumbnail ? 'image-cropper' : 'image-editor', type });
      updateQueuedFile(uppy.getFile(id));
      showSuccessToast('Image edited. Upload it to apply your changes.');
      return true;
    } catch (error) {
      // File events are suppressed during replacement, so rollback preserves the preview too.
      uppy.setState({ files: previousFiles });
      const message = error instanceof Error ? error.message : 'Could not queue the edited image.';
      setUploadError(message);
      throw new Error(message);
    } finally {
      replacingFile.current = false;
    }
  };

  const EditingDialog = cropThumbnail ? ImageCropperDialog : ImageEditorDialog;

  return (
    <div className='space-y-3'>
      {/* Dropzone or Immersive Preview. Errors render inside either one, so the card never changes height. */}
      {!fileInQueue && !value ? (
        <div ref={dropzoneWrapperRef}>
          <FileDropzone
            accept={{
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
              'image/webp': ['.webp']
            }}
            activeTitle='Drop thumbnail here'
            aspect='video'
            disabled={dropDisabled}
            error={uploadError}
            fileTypeLabel='PNG, JPG, or WEBP'
            hint='PNG, JPG, WEBP up to 10 MB'
            icon={<ImageIcon />}
            inputLabel='Choose thumbnail image'
            label='Browse thumbnail images'
            maxSize={10 * 1024 * 1024}
            title='Drop thumbnail here or browse files'
            onErrorDismiss={() => setUploadError(null)}
            onFilesAccepted={handleFilesAccepted}
          />
        </div>
      ) : (
        <FilePreview
          name={fileInQueue?.name || derivedFileName || value?.split('/').pop() || 'Image'}
          actions={
            <>
              {fileInQueue && !isUploadComplete && (
                <Button type='button' disabled={actionsDisabled} size='sm' variant='outline' onClick={handleUpload}>
                  <Upload aria-hidden='true' />
                  {uploadError ? 'Retry' : 'Upload'}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      ref={actionsRef}
                      type='button'
                      disabled={actionsDisabled}
                      size='icon-sm'
                      variant='outline'
                      aria-label='Image actions'
                    />
                  }
                  disabled={actionsDisabled}
                >
                  <MoreVertical aria-hidden='true' />
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-auto' positionerProps={{ align: 'end' }}>
                  {(fileInQueue || value) && (
                    <DropdownMenuItem disabled={actionsDisabled} onClick={handleEdit}>
                      <Edit aria-hidden='true' />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled={actionsDisabled} variant='destructive' onClick={handleClear}>
                    <Trash2 aria-hidden='true' />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
          error={uploadError}
          meta={displayFileSize ? `${(displayFileSize / 1024 / 1024).toFixed(2)} MB` : undefined}
          progress={isUploading && uploadProgress > 0 ? uploadProgress : null}
          progressIndeterminate={isUploading}
          progressLabel={`Uploading ${fileInQueue?.name || derivedFileName || ''}`}
          status={fileInQueue && !isUploadComplete ? 'Ready to upload' : undefined}
          statusTone='success'
          uploaded={isUploadComplete || !!(value && !fileInQueue)}
        >
          {(previewUrl || value) && (
            <Image
              className='h-full w-full object-contain'
              fill
              alt='Preview'
              sizes='(min-width: 1536px) 33vw, 100vw'
              src={normalizeImageUrl(previewUrl || value || '')}
            />
          )}
        </FilePreview>
      )}

      {/* Image editor retains its source through the closing transition. */}
      {editingFile && (
        <EditingDialog
          {...(cropThumbnail ? { defaultRatioPreset: '16:9' as const } : {})}
          imageFileName={editingFile.fileName}
          imageSrc={editingFile.src}
          open={editorOpen}
          onOpenChange={open => {
            if (!open) closeEditor();
          }}
          onOpenChangeComplete={open => {
            if (!open) {
              setEditingFile(null);
              releaseObjectUrl('editor');
              const dropzone = dropzoneWrapperRef.current;
              const input = dropzone?.querySelector<HTMLInputElement>('input[type="file"]');
              if (input) input.value = '';
              requestAnimationFrame(() =>
                (actionsRef.current ?? dropzone?.querySelector<HTMLElement>('[data-slot="file-dropzone"]'))?.focus()
              );
            }
          }}
          onSave={handleEditorSave}
        />
      )}
    </div>
  );
}
