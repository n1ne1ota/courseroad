'use client';

import type { JSX } from 'react';
import { useState } from 'react';

import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';

import { showErrorToast, showSuccessToast } from '@courseroad/iota-ui';
import { Button, Input } from '@courseroad/kurume-ui';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';

import { reorderLessons } from '@/features/course/actions/lesson-actions';
import { createModule, reorderModules } from '@/features/course/actions/module-actions';
import { CourseSortableModule } from '@/features/course/components/course-sortable-module';

import type { Lesson, Module } from '@/features/course/types';

type ModuleWithLessons = Module & {
  lessons: Lesson[];
};

interface CourseModuleListProps {
  activeLessonId: string | null;
  courseId: string;
  modules: ModuleWithLessons[];
  onModulesChange: (modules: ModuleWithLessons[]) => void;
  onSelectLesson: (id: string | null) => void;
}

export function CourseModuleList({
  activeLessonId,
  courseId,
  modules,
  onModulesChange,
  onSelectLesson
}: CourseModuleListProps): JSX.Element {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<ModuleWithLessons | Lesson | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Check if dragging a module
    const activeModule = modules.find(m => m.id === active.id);
    if (activeModule) {
      setActiveItem(activeModule);
      return;
    }

    // Check if dragging a lesson
    const activeLesson = modules.flatMap(m => m.lessons).find(l => l.id === active.id);
    if (activeLesson) setActiveItem(activeLesson);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeType = active.data.current?.type;
    const overType = over?.data.current?.type;

    if (activeType === 'Lesson') {
      const activeLessonId = active.id as string;
      const activeModule = modules.find(m => m.lessons.some(l => l.id === activeLessonId));

      // If dropping generic over a Module (dropping lesson into a module area)
      if (overType === 'Module') {
        const overModuleId = overId as string;
        const overModule = modules.find(m => m.id === overModuleId);

        if (activeModule && overModule && activeModule.id !== overModule.id) {
          // Move lesson to new module
          const newModules = [...modules];
          const activeModuleIndex = newModules.findIndex(m => m.id === activeModule.id);
          const overModuleIndex = newModules.findIndex(m => m.id === overModule.id);

          if (activeModuleIndex === -1 || overModuleIndex === -1) return;

          const sourceModule = newModules[activeModuleIndex];
          const targetModule = newModules[overModuleIndex];

          if (!sourceModule || !targetModule) return;

          const activeLessonIndex = sourceModule.lessons.findIndex(l => l.id === activeLessonId);

          if (activeLessonIndex === -1) return;

          const [movedLesson] = sourceModule.lessons.splice(activeLessonIndex, 1);

          if (!movedLesson) return;

          // Assign new module ID locally for the state
          movedLesson.moduleId = overModule.id;

          // Add to over module at the end by default if just hovering the module container
          targetModule.lessons.push(movedLesson);

          onModulesChange(newModules);
        }
      }

      // If dropping over another Lesson (reordering or moving between modules)
      if (overType === 'Lesson') {
        const overLessonId = overId as string;
        const overModule = modules.find(m => m.lessons.some(l => l.id === overLessonId));

        if (activeModule && overModule) {
          // Moving between different modules
          if (activeModule.id !== overModule.id) {
            const newModules = [...modules];
            const activeModuleIndex = newModules.findIndex(m => m.id === activeModule.id);
            const overModuleIndex = newModules.findIndex(m => m.id === overModule.id);

            if (activeModuleIndex === -1 || overModuleIndex === -1) return;

            const sourceModule = newModules[activeModuleIndex];
            const targetModule = newModules[overModuleIndex];

            if (!sourceModule || !targetModule) return;

            const activeLessonIndex = sourceModule.lessons.findIndex(l => l.id === activeLessonId);
            const overLessonIndex = targetModule.lessons.findIndex(l => l.id === overLessonId);

            if (activeLessonIndex === -1 || overLessonIndex === -1) return;

            const [movedLesson] = sourceModule.lessons.splice(activeLessonIndex, 1);

            if (!movedLesson) return;
            movedLesson.moduleId = overModule.id;

            // Insert into new position
            targetModule.lessons.splice(overLessonIndex, 0, movedLesson);

            onModulesChange(newModules);
          }
        }
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;
    const overId = over?.id as string;

    setActiveId(null);
    setActiveItem(null);

    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'Module') {
      let overModuleId = overId;
      // If dropping module over a lesson, finding the parent module
      if (overType === 'Lesson') {
        const foundModule = modules.find(m => m.lessons.some(l => l.id === overId));
        if (foundModule) {
          overModuleId = foundModule.id;
        }
      }

      if (activeId !== overModuleId) {
        const oldIndex = modules.findIndex(m => m.id === activeId);
        const newIndex = modules.findIndex(m => m.id === overModuleId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newModules = arrayMove(modules, oldIndex, newIndex);
          onModulesChange(newModules);

          const reorderData = newModules.map((m, i) => ({ id: m.id, position: i + 1 }));
          let success = false;
          try {
            const result = await reorderModules(reorderData);
            if (result.success) {
              success = true;
            } else {
              showErrorToast(result.error || 'Failed to reorder modules');
            }
          } catch {
            showErrorToast('Failed to reorder modules');
          }

          if (!success) {
            onModulesChange(modules);
          }
        }
      }
    } else if (activeType === 'Lesson') {
      const activeModule = modules.find(m => m.lessons.some(l => l.id === activeId));
      let overModule = modules.find(m => m.lessons.some(l => l.id === overId));

      if (!overModule && overType === 'Module') {
        overModule = modules.find(m => m.id === overId);
      }

      if (activeModule && overModule) {
        if (activeModule.id === overModule.id) {
          const oldIndex = activeModule.lessons.findIndex(l => l.id === activeId);
          const newIndex = activeModule.lessons.findIndex(l => l.id === overId);

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const newLessons = arrayMove(activeModule.lessons, oldIndex, newIndex);
            const newModules = modules.map(m => (m.id === activeModule.id ? { ...m, lessons: newLessons } : m));
            onModulesChange(newModules);

            const reorderData = newLessons.map((l, i) => ({
              id: l.id,
              moduleId: activeModule.id,
              position: i + 1
            }));

            let success = false;
            try {
              const result = await reorderLessons(reorderData);
              if (result.success) {
                success = true;
              } else {
                showErrorToast(result.error || 'Failed to update lesson order');
              }
            } catch {
              showErrorToast('Failed to update lesson order');
            }

            if (!success) {
              onModulesChange(modules);
            }
          }
        } else {
          // Cross-module move
          // The visual move was handled in handleDragOver, we just need to persist the new order
          const destLessons = overModule.lessons;
          const reorderData = destLessons.map((l, i) => ({
            id: l.id,
            moduleId: overModule.id,
            position: i + 1
          }));

          try {
            const result = await reorderLessons(reorderData);
            if (!result.success) {
              showErrorToast(result.error || 'Failed to update lesson order');
              return;
            }
          } catch {
            showErrorToast('Failed to update lesson order');
          }
        }
      }
    }
  };

  const handleCreateModule = async () => {
    if (!newModuleTitle.trim()) return;

    try {
      setIsCreating(true);
      const result = await createModule({ courseId, title: newModuleTitle });
      if (!result.success || !result.data) {
        showErrorToast(result.error || 'Failed to create module');
        return;
      }
      const newModule = result.data;
      onModulesChange([...modules, { ...newModule, lessons: [] }]);
      setNewModuleTitle('');
      showSuccessToast('Module created');
    } catch {
      showErrorToast('Failed to create module');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='space-y-4'>
      {/* Module Input */}
      <div className='flex gap-2'>
        <Input
          className='h-9'
          placeholder='New Module Title'
          value={newModuleTitle}
          onChange={e => setNewModuleTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreateModule()}
        />
        <Button disabled={!newModuleTitle.trim()} isLoading={isCreating} variant='primary' onClick={handleCreateModule}>
          {isCreating ? (
            'Adding'
          ) : (
            <>
              <Plus className='h-4 w-4' />
              Add Module
            </>
          )}
        </Button>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
      >
        <SortableContext items={modules} strategy={verticalListSortingStrategy}>
          <div className='space-y-4'>
            {modules.map((module, index) => (
              <CourseSortableModule
                key={module.id}
                activeLessonId={activeLessonId}
                allModules={modules}
                index={index}
                module={module}
                onModulesChange={onModulesChange}
                onSelectLesson={onSelectLesson}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && activeItem ? (
            // Check if it's a module or lesson based on properties or type guard
            'lessons' in activeItem ? (
              <div className='w-[300px] cursor-grabbing rounded-xl border bg-card p-3 opacity-90 shadow-2xl'>
                <span className='text-lg font-bold'>{(activeItem as Module).title}</span>
              </div>
            ) : (
              <div className='flex w-[250px] cursor-grabbing items-center gap-2 rounded-lg border bg-card p-2 opacity-90 shadow-2xl'>
                <div className='rounded-full bg-primary/10 p-1'>
                  <span className='block h-4 w-4 rounded-full bg-primary' />
                </div>
                <span className='font-medium'>{(activeItem as Lesson).title}</span>
              </div>
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
