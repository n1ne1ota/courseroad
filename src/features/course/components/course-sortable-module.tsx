'use client';

import type { JSX } from 'react';
import { useCallback, useState } from 'react';

import { showErrorToast, showSuccessToast } from '@courseroad/iota-ui';
import { Badge } from '@courseroad/kurume-ui';
import { Button } from '@courseroad/kurume-ui';
import { ConfirmationDialog } from '@courseroad/kurume-ui';
import { Input } from '@courseroad/kurume-ui';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Plus, Trash } from 'lucide-react';

import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils/cn';

import { createLesson, deleteLesson } from '@/features/course/actions/lesson-actions';
import { deleteModule, updateModule } from '@/features/course/actions/module-actions';

import type { Lesson, Module } from '@/features/course/types';

import { SortableLesson } from './course-sortable-lesson';

type ModuleWithLessons = Module & {
  lessons: Lesson[];
};

interface SortableModuleProps {
  activeLessonId: string | null;
  allModules: ModuleWithLessons[];
  index: number;
  module: ModuleWithLessons;
  onModulesChange: (modules: ModuleWithLessons[]) => void;
  onSelectLesson: (id: string | null) => void;
}

export function CourseSortableModule({
  activeLessonId,
  allModules,
  index,
  module,
  onModulesChange,
  onSelectLesson
}: SortableModuleProps): JSX.Element {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    data: { module, type: 'Module' },
    id: module.id
  });

  const { inView, ref } = useInView<HTMLDivElement>({ once: true, threshold: 0.1 });
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      ref(node);
    },
    [ref, setNodeRef]
  );

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    transitionDelay: isDragging ? '0ms' : `${index * 50}ms`
  };

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(module.title);

  // Dialog states
  const [showDeleteModuleDialog, setShowDeleteModuleDialog] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);

  const handleUpdateModule = async () => {
    if (!title.trim() || title === module.title) {
      setIsEditing(false);
      return;
    }

    const previousTitle = module.title;

    // Optimistic update
    const newModules = allModules.map(m => (m.id === module.id ? { ...m, title } : m));
    onModulesChange(newModules);
    setIsEditing(false);

    let success = false;
    try {
      const result = await updateModule({ moduleId: module.id, title });
      if (result.success) {
        success = true;
        showSuccessToast('Module updated');
      } else {
        showErrorToast(result.error || 'Failed to update module');
      }
    } catch {
      showErrorToast('Failed to update module');
    }

    if (!success) {
      // Revert optimism
      const revertedModules = allModules.map(m => (m.id === module.id ? { ...m, title: previousTitle } : m));
      onModulesChange(revertedModules);
      setTitle(previousTitle);
    }
  };

  const handleDeleteModule = async () => {
    try {
      const result = await deleteModule({ moduleId: module.id });
      if (!result.success) {
        showErrorToast(result.error || 'Failed to delete module');
        return;
      }
      const newModules = allModules.filter(m => m.id !== module.id);
      onModulesChange(newModules);
      showSuccessToast('Module deleted');
    } catch {
      showErrorToast('Failed to delete module');
    }
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      const result = await deleteLesson({ lessonId: id });
      if (!result.success) {
        showErrorToast(result.error || 'Failed to delete lesson');
        return;
      }
      const newModules = allModules.map(m => {
        if (m.id === module.id) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== id) };
        }
        return m;
      });
      onModulesChange(newModules);
      showSuccessToast('Lesson deleted');
      if (activeLessonId === id) onSelectLesson(null);
    } catch {
      showErrorToast('Failed to delete lesson');
    }
  };

  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const handleCreateLesson = async () => {
    try {
      setIsCreatingLesson(true);
      const result = await createLesson({ moduleId: module.id, title: 'New Lesson' });
      if (!result.success || !result.data) {
        showErrorToast(result.error || 'Failed to create lesson');
        return;
      }
      const newLesson = result.data;

      const newModules = allModules.map(m => {
        if (m.id === module.id) {
          return { ...m, lessons: [...m.lessons, newLesson] };
        }
        return m;
      });

      onModulesChange(newModules);
      showSuccessToast('Lesson created');
    } catch {
      showErrorToast('Failed to create lesson');
    } finally {
      setIsCreatingLesson(false);
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setRefs}
        className='h-[100px] rounded-lg border-2 border-primary/20 bg-muted/50 opacity-50'
        style={style}
      />
    );
  }

  return (
    <>
      <div
        ref={setRefs}
        className={cn(
          'group rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-700 ease-out',
          'data-[in-view=false]:translate-y-4 data-[in-view=false]:opacity-0 data-[in-view=true]:translate-y-0 data-[in-view=true]:opacity-100',
          activeLessonId && module.lessons.some(l => l.id === activeLessonId) && 'border-primary/50'
        )}
        style={style}
        data-in-view={inView}
      >
        <div className='flex items-center gap-2 rounded-t-xl border-b bg-muted/30 p-3'>
          <button {...attributes} {...listeners} className='cursor-grab rounded p-1 transition-colors hover:bg-muted'>
            <GripVertical className='h-4 w-4 text-muted-foreground' />
          </button>

          <div className='min-w-0 flex-1'>
            {isEditing ? (
              <Input
                className='h-8'
                autoFocus
                value={title}
                onBlur={handleUpdateModule}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUpdateModule()}
              />
            ) : (
              <div className='flex items-center gap-2'>
                <span className='truncate font-medium'>{module.title}</span>
                <Badge className='text-xs' variant='outline'>
                  {module.lessons.length} Lessons
                </Badge>
              </div>
            )}
          </div>

          <div className='flex items-center gap-1'>
            <Button
              className='h-8 w-8 hover:bg-primary/10 hover:text-primary'
              size='icon'
              variant='ghost'
              onClick={() => setIsEditing(true)}
            >
              <Pencil className='h-4 w-4' />
            </Button>
            <Button
              className='h-8 w-8 hover:bg-destructive/10 hover:text-destructive'
              size='icon'
              variant='ghost'
              onClick={() => setShowDeleteModuleDialog(true)}
            >
              <Trash className='h-4 w-4' />
            </Button>
            <Button
              className='ml-2 h-8'
              isLoading={isCreatingLesson}
              size='sm'
              variant='secondary'
              onClick={handleCreateLesson}
            >
              {isCreatingLesson ? (
                'Adding'
              ) : (
                <>
                  <Plus className='h-4 w-4' />
                  <span className='hidden sm:inline'>Add Lesson</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className='min-h-[10px] space-y-2 p-2'>
          <SortableContext items={module.lessons} strategy={verticalListSortingStrategy}>
            {module.lessons.length === 0 && (
              <div className='rounded-lg border border-dashed py-4 text-center text-sm text-muted-foreground'>
                No lessons in this module
              </div>
            )}
            {module.lessons.map(lesson => (
              <SortableLesson
                key={lesson.id}
                isActive={activeLessonId === lesson.id}
                lesson={lesson}
                onClick={() => onSelectLesson(lesson.id)}
                onDelete={id => setLessonToDelete(id)}
              />
            ))}
          </SortableContext>
        </div>
      </div>

      {/* Delete Module Confirmation */}
      <ConfirmationDialog
        confirmText='Delete'
        description='This will permanently delete this module and all its lessons. This action cannot be undone.'
        open={showDeleteModuleDialog}
        title='Delete Module?'
        variant='destructive'
        onConfirm={handleDeleteModule}
        onOpenChange={setShowDeleteModuleDialog}
      />

      {/* Delete Lesson Confirmation */}
      <ConfirmationDialog
        confirmText='Delete'
        description='This will permanently delete this lesson. This action cannot be undone.'
        open={lessonToDelete !== null}
        title='Delete Lesson?'
        variant='destructive'
        onConfirm={async () => {
          if (lessonToDelete) {
            await handleDeleteLesson(lessonToDelete);
          }
        }}
        onOpenChange={open => {
          if (!open) setLessonToDelete(null);
        }}
      />
    </>
  );
}
