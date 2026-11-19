'use client';
import type { JSX, ReactNode } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@courseroad/kurume-ui';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, FileText, GripVertical, LoaderCircle, Trash, TriangleAlert, Video } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

import type { Lesson } from '@/features/course/types/course-types';

import { ActionsMenuTrigger } from './course-actions-menu-trigger';

interface SortableLessonProps {
  isActive: boolean;
  lesson: Lesson;
  disabled: boolean;
  readOnly: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
  onReorder: (delta: number) => void;
}

/** Icon with a Kurume tooltip. Keeps `role='img'` and an accessible name for screen readers. */
function StatusIcon({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span className={cn('shrink-0', className ?? 'text-muted-foreground')} role='img' aria-label={label} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** What the lesson delivers, so a creator can scan the curriculum for problems without opening each lesson. */
function LessonStatusIcon({ lesson }: { lesson: Pick<Lesson, 'videoUrl' | 'videoStatus'> }): JSX.Element {
  if (lesson.videoUrl && lesson.videoStatus === 'Failed')
    return (
      <StatusIcon className='text-destructive' label='Video failed to process'>
        <TriangleAlert className='h-4 w-4' />
      </StatusIcon>
    );
  if (lesson.videoUrl && lesson.videoStatus === 'Processing')
    return (
      <StatusIcon label='Video is processing'>
        <LoaderCircle className='h-4 w-4 motion-safe:animate-spin' />
      </StatusIcon>
    );
  if (lesson.videoUrl)
    return (
      <StatusIcon label='Video lesson'>
        <Video className='h-4 w-4' />
      </StatusIcon>
    );
  return (
    <StatusIcon label='Text lesson'>
      <FileText className='h-4 w-4' />
    </StatusIcon>
  );
}

export function SortableLesson({
  isActive,
  lesson,
  disabled,
  readOnly,
  canMoveUp,
  canMoveDown,
  onClick,
  onDelete,
  onReorder
}: SortableLessonProps): JSX.Element {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    data: { type: 'Lesson' },
    id: lesson.id,
    disabled
  });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group flex h-10 items-center gap-2 rounded-lg border bg-background px-2.5 text-sm transition-colors hover:bg-muted/40',
        // Keyboard focus on the title rings the whole row, like an input, instead of the browser's square outline.
        'has-[[data-lesson-title]:focus-visible]:border-ring has-[[data-lesson-title]:focus-visible]:ring-3 has-[[data-lesson-title]:focus-visible]:ring-ring/50',
        // Line the actions button up with the one in the module header above (12px from the card edge).
        !readOnly && 'pr-[3px]',
        isActive && 'border-brand bg-muted/40'
      )}
      style={{ transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      data-testid='curriculum-lesson'
    >
      {!readOnly && (
        <button
          type='button'
          {...attributes}
          {...listeners}
          className='cursor-grab rounded p-1 text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none'
          disabled={disabled}
          aria-label={`Drag lesson ${lesson.title}`}
        >
          <GripVertical className='h-4 w-4' />
        </button>
      )}
      <LessonStatusIcon lesson={lesson} />
      <button
        className='min-w-0 flex-1 truncate text-left font-medium focus-visible:outline-none'
        type='button'
        disabled={disabled}
        aria-pressed={isActive}
        data-lesson-title
        onClick={onClick}
      >
        {lesson.title}
      </button>
      {!readOnly && (
        <DropdownMenu>
          <ActionsMenuTrigger
            // Hidden until the row is hovered or focused. Touch screens have no hover, so keep it visible there.
            className={cn(
              'shrink-0 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 data-[popup-open]:opacity-100 pointer-coarse:opacity-100',
              isActive && 'opacity-100'
            )}
            disabled={disabled}
            label={`Actions for lesson ${lesson.title}`}
          />
          <DropdownMenuContent className='min-w-44' align='end'>
            <DropdownMenuItem disabled={!canMoveUp} onClick={() => onReorder(-1)}>
              <ArrowUp className='h-4 w-4' />
              Move up
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!canMoveDown} onClick={() => onReorder(1)}>
              <ArrowDown className='h-4 w-4' />
              Move down
            </DropdownMenuItem>
            <DropdownMenuItem variant='destructive' onClick={() => onDelete(lesson.id)}>
              <Trash className='h-4 w-4' />
              Delete lesson
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
