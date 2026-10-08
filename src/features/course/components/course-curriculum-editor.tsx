'use client';

import type { JSX } from 'react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@courseroad/kurume-ui';
import { LayoutListIcon, MousePointerClickIcon } from 'lucide-react';
import { useQueryState } from 'nuqs';

import { CourseLessonEditor } from '@/features/course/components/course-lesson-editor';
import { CourseModuleList } from '@/features/course/components/course-module-list';

import type { Lesson, Module } from '@/features/course/types';

type ModuleWithLessons = Module & {
  lessons: Lesson[];
};

interface CourseCurriculumProps {
  courseId: string;
  modules: ModuleWithLessons[];
}

export function CourseCurriculumEditor({ courseId, modules: initialModules }: CourseCurriculumProps): JSX.Element {
  const [modules, setModules] = useState<ModuleWithLessons[]>(initialModules);
  const [lessonId, setLessonId] = useQueryState('lessonId');

  // Find active lesson based on URL param
  const activeLesson = modules.flatMap(m => m.lessons).find(l => l.id === lessonId);

  const handleLessonChange = (updatedLesson: Lesson) => {
    const newModules = modules.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson => (lesson.id === updatedLesson.id ? updatedLesson : lesson))
    }));
    setModules(newModules);
  };

  return (
    <div className='grid grid-cols-1 gap-6 2xl-screen:grid-cols-3'>
      {/* Left Column: Modules & Lessons List (1/3) */}
      <div className='2xl-screen:col-span-1'>
        <Card>
          <CardHeader>
            <CardTitle icon={<LayoutListIcon />} iconColor='primary' iconVariant='glow'>
              Curriculum Editor
            </CardTitle>
            <CardDescription>Drag and drop to reorder modules and lessons</CardDescription>
          </CardHeader>
          <CardContent>
            <CourseModuleList
              activeLessonId={lessonId}
              courseId={courseId}
              modules={modules}
              onModulesChange={setModules}
              onSelectLesson={setLessonId}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Editor (2/3) */}
      <div className='2xl-screen:col-span-2'>
        <div className='sticky top-6'>
          {activeLesson ? (
            <CourseLessonEditor
              key={activeLesson.id}
              lesson={activeLesson}
              onDelete={() => setLessonId(null)}
              onLessonChange={handleLessonChange}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle icon={<MousePointerClickIcon />} iconColor='primary' iconVariant='glow'>
                  No Lesson Selected
                </CardTitle>
                <CardDescription>Select a lesson to start editing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex h-[400px] w-full flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 text-center text-muted-foreground'>
                  <p className='text-sm'>Select a lesson from the curriculum</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
