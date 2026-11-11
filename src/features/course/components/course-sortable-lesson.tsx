import type { JSX } from 'react';

import { Button } from '@courseroad/kurume-ui';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash, Video } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

import type { Lesson } from '@/features/course/types';

interface SortableLessonProps {
  isActive: boolean;
  lesson: Lesson;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function SortableLesson({ isActive, lesson, onClick, onDelete }: SortableLessonProps): JSX.Element {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    data: { lesson, type: 'Lesson' },
    id: lesson.id
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        className='h-[40px] rounded-lg border border-primary/20 bg-primary/10 opacity-70'
        style={style}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group relative flex cursor-pointer items-center gap-2 rounded-lg border bg-background p-2 text-sm transition-colors',
        isActive && 'border-white'
      )}
      style={style}
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <button
        {...attributes}
        {...listeners}
        className='cursor-grab rounded p-1 text-muted-foreground hover:text-foreground'
        onClick={event => event.stopPropagation()}
      >
        <GripVertical className='h-4 w-4' />
      </button>

      <div className='rounded-full bg-muted p-1 text-muted-foreground'>
        <Video className='h-4 w-4' />
      </div>

      <div className='ml-1 min-w-0 flex-1'>
        <span className='block truncate font-medium'>{lesson.title}</span>
      </div>

      {/* Delete button - only visible when selected */}
      {isActive && (
        <Button
          className='h-6 w-6 hover:bg-transparent hover:text-destructive'
          size='icon'
          variant='ghost'
          onClick={event => {
            event.stopPropagation();
            onDelete(lesson.id);
          }}
        >
          <Trash className='h-3 w-3' />
        </Button>
      )}
    </div>
  );
}
