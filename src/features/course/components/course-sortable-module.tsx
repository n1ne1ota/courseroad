'use client';

import type { JSX } from 'react';
import { useState } from 'react';

import {
  Badge,
  Button,
  ConfirmationDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  Input
} from '@courseroad/kurume-ui';

import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Trash } from 'lucide-react';

import type { CurriculumRun } from '@/features/course/components/course-module-list';
import type { CurriculumModule } from '@/features/course/types/curriculum-types';

import { ActionsMenuTrigger } from './course-actions-menu-trigger';
import { SortableLesson } from './course-sortable-lesson';

interface SortableModuleProps {
  activeLessonId: string | null;
  allModules: CurriculumModule[];
  index: number;
  module: CurriculumModule;
  courseId: string;
  disabled: boolean;
  readOnly: boolean;
  run: CurriculumRun;
  onSelectLesson: (id: string | null) => Promise<void>;
}
export function CourseSortableModule({
  activeLessonId,
  allModules,
  index,
  module,
  courseId,
  disabled,
  readOnly,
  run,
  onSelectLesson
}: SortableModuleProps): JSX.Element {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    data: { type: 'Module' },
    id: module.id,
    disabled
  });
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [deleteModule, setDeleteModule] = useState(false);
  const [deleteLesson, setDeleteLesson] = useState<string | null>(null);
  const startRename = () => {
    if (readOnly || disabled) return;
    setTitle(module.title);
    setEditing(true);
  };
  const rename = async () => {
    if (!editing || disabled) return;
    setEditing(false);
    if (title.trim() && title !== module.title)
      await run({ courseId, operation: 'updateModule', moduleId: module.id, title });
  };
  const moveModule = (delta: number) =>
    void run({
      courseId,
      operation: 'reorderModules',
      ids: arrayMove(allModules, index, index + delta).map(row => row.id)
    });
  const addLesson = () => void run({ courseId, operation: 'createLesson', moduleId: module.id, title: 'New Lesson' });
  return (
    <>
      <div
        ref={setNodeRef}
        className='rounded-xl border bg-card text-card-foreground shadow-sm'
        style={{ transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
        data-module-id={module.id}
        data-testid='curriculum-module'
      >
        <div className='flex items-center gap-2 rounded-t-xl border-b bg-muted/30 px-3 py-2.5'>
          {!readOnly && (
            <button
              type='button'
              {...attributes}
              {...listeners}
              className='cursor-grab rounded p-1 text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none'
              disabled={disabled}
              aria-label={`Drag module ${module.title}`}
            >
              <GripVertical className='h-4 w-4' />
            </button>
          )}
          <div className='min-w-0 flex-1'>
            {editing ? (
              <Input
                style={{ height: '2rem' }}
                autoFocus
                disabled={disabled}
                value={title}
                aria-label='Module title'
                onBlur={() => void rename()}
                onChange={event => setTitle(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void rename();
                  }
                  if (event.key === 'Escape') setEditing(false);
                }}
              />
            ) : (
              <div className='flex items-center gap-2'>
                <span className='truncate font-medium' onDoubleClick={startRename}>
                  {module.title}
                </span>
                <Badge color={module.lessons.length ? 'brand' : 'warning'} size='sm'>
                  {module.lessons.length} {module.lessons.length === 1 ? 'Lesson' : 'Lessons'}
                </Badge>
              </div>
            )}
          </div>
          {!readOnly && (
            <DropdownMenu>
              <ActionsMenuTrigger disabled={disabled} label={`Actions for module ${module.title}`} />
              <DropdownMenuContent className='min-w-44' align='end'>
                <DropdownMenuItem onClick={startRename}>
                  <Pencil className='h-4 w-4' />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem disabled={index === 0} onClick={() => moveModule(-1)}>
                  <ArrowUp className='h-4 w-4' />
                  Move up
                </DropdownMenuItem>
                <DropdownMenuItem disabled={index === allModules.length - 1} onClick={() => moveModule(1)}>
                  <ArrowDown className='h-4 w-4' />
                  Move down
                </DropdownMenuItem>
                <DropdownMenuItem variant='destructive' onClick={() => setDeleteModule(true)}>
                  <Trash className='h-4 w-4' />
                  Delete module
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className='min-h-12 space-y-2 p-2'>
          <SortableContext
            id={`lessons-${module.id}`}
            items={module.lessons.map(lesson => lesson.id)}
            strategy={verticalListSortingStrategy}
          >
            {module.lessons.map((lesson, lessonIndex) => (
              <SortableLesson
                key={lesson.id}
                canMoveDown={lessonIndex < module.lessons.length - 1}
                canMoveUp={lessonIndex > 0}
                disabled={disabled}
                isActive={activeLessonId === lesson.id}
                lesson={lesson}
                readOnly={readOnly}
                onClick={() => void onSelectLesson(lesson.id)}
                onDelete={setDeleteLesson}
                onReorder={delta =>
                  void run({
                    courseId,
                    operation: 'reorderLessons',
                    moduleId: module.id,
                    ids: arrayMove(module.lessons, lessonIndex, lessonIndex + delta).map(row => row.id)
                  })
                }
              />
            ))}
          </SortableContext>
          {!readOnly ? (
            <Button
              className='w-full rounded-lg'
              type='button'
              disabled={disabled}
              variant='dashed'
              aria-label={`Add lesson to ${module.title}`}
              onClick={addLesson}
            >
              <Plus />
              {module.lessons.length ? 'Add lesson' : 'Add the first lesson'}
            </Button>
          ) : (
            !module.lessons.length && (
              <p className='rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground'>
                No lessons in this module
              </p>
            )
          )}
        </div>
      </div>
      <ConfirmationDialog
        confirmText='Delete'
        description='This will permanently delete this module and all its lessons.'
        open={deleteModule}
        title='Delete Module?'
        variant='destructive'
        onConfirm={() => run({ courseId, operation: 'deleteModule', moduleId: module.id }).then(() => undefined)}
        onOpenChange={setDeleteModule}
      />
      <ConfirmationDialog
        confirmText='Delete'
        description='This will permanently delete this lesson.'
        open={deleteLesson !== null}
        title='Delete Lesson?'
        variant='destructive'
        onConfirm={async () => {
          if (deleteLesson) await run({ courseId, operation: 'deleteLesson', lessonId: deleteLesson });
        }}
        onOpenChange={open => {
          if (!open) setDeleteLesson(null);
        }}
      />
    </>
  );
}
