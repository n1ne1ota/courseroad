'use client';
import type { JSX } from 'react';
import { useRef, useState } from 'react';

import type { DragEndEvent } from '@dnd-kit/core';

import { Button, Input } from '@courseroad/kurume-ui';

import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';

import { CourseSortableModule } from '@/features/course/components/course-sortable-module';
import { curriculumCollision, curriculumKeyboardCoordinates } from '@/features/course/lib/curriculum-drag';

import type { OrganizationCurriculumInput } from '@/features/course/schemas/curriculum-schemas';
import type { CurriculumModule } from '@/features/course/types/curriculum-types';

export type CurriculumRun = (input: OrganizationCurriculumInput) => Promise<boolean>;
interface CourseModuleListProps {
  activeLessonId: string | null;
  courseId: string;
  modules: CurriculumModule[];
  disabled: boolean;
  readOnly: boolean;
  onSelectLesson: (id: string | null) => Promise<void>;
  run: CurriculumRun;
}
export function CourseModuleList({
  activeLessonId,
  courseId,
  modules,
  disabled,
  readOnly,
  onSelectLesson,
  run
}: CourseModuleListProps): JSX.Element {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const titleInput = useRef<HTMLInputElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: curriculumKeyboardCoordinates })
  );
  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (disabled || !over || active.id === over.id) return;
    const target = modules.find(
      module => module.id === over.id || module.lessons.some(lesson => lesson.id === over.id)
    );
    if (!target) return;
    if (active.data.current?.type === 'Module') {
      const from = modules.findIndex(module => module.id === active.id);
      const to = modules.findIndex(module => module.id === target.id);
      if (from >= 0 && from !== to)
        await run({
          courseId,
          operation: 'reorderModules',
          ids: arrayMove(modules, from, to).map(module => module.id)
        });
    } else {
      const source = modules.find(module => module.lessons.some(lesson => lesson.id === active.id));
      if (!source) return;
      const index = target.lessons.findIndex(lesson => lesson.id === over.id);
      if (source.id !== target.id)
        await run({
          courseId,
          operation: 'moveLesson',
          lessonId: String(active.id),
          targetModuleId: target.id,
          targetIndex: index < 0 ? target.lessons.length : index
        });
      else {
        const from = source.lessons.findIndex(lesson => lesson.id === active.id);
        const to = index < 0 ? source.lessons.length - 1 : index;
        if (from !== to)
          await run({
            courseId,
            operation: 'reorderLessons',
            moduleId: source.id,
            ids: arrayMove(source.lessons, from, to).map(lesson => lesson.id)
          });
      }
    }
  };
  const create = async () => {
    if (disabled) return;
    // The button stays enabled so it never looks broken; with no title it just moves focus to the field.
    if (!newModuleTitle.trim()) {
      titleInput.current?.focus();
      return;
    }
    if (await run({ courseId, operation: 'createModule', title: newModuleTitle })) setNewModuleTitle('');
  };
  const dragging =
    modules.find(module => module.id === activeId) ??
    modules.flatMap(module => module.lessons).find(lesson => lesson.id === activeId);
  return (
    <div className='space-y-4'>
      {!readOnly && (
        // The form sits above the list so it stays in reach however many modules there are.
        <div className='flex gap-2'>
          <Input
            ref={titleInput}
            disabled={disabled}
            placeholder='New module title'
            value={newModuleTitle}
            aria-label='New module title'
            onChange={event => setNewModuleTitle(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void create();
              }
            }}
          />
          <Button type='button' disabled={disabled} onClick={() => void create()}>
            <Plus className='h-4 w-4' />
            Add Module
          </Button>
        </div>
      )}
      <DndContext
        id={`curriculum-${courseId}`}
        collisionDetection={curriculumCollision}
        sensors={sensors}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
        onDragStart={event => setActiveId(String(event.active.id))}
      >
        <SortableContext
          id={`modules-${courseId}`}
          items={modules.map(module => module.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className='space-y-4'>
            {modules.map((module, index) => (
              <CourseSortableModule
                key={module.id}
                activeLessonId={activeLessonId}
                allModules={modules}
                courseId={courseId}
                disabled={disabled}
                index={index}
                module={module}
                readOnly={readOnly}
                run={run}
                onSelectLesson={onSelectLesson}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {dragging && <div className='rounded-lg border bg-card p-3 shadow-xl'>{dragging.title}</div>}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
