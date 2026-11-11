import 'server-only';

import type { JSX } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@courseroad/kurume-ui';

import { loadLearnerCoursesView } from '@/features/course/server/loaders/organization-learner-courses';
import { readForPage } from '@/server/auth/page-access';

export async function LearnerCoursesView(): Promise<JSX.Element> {
  const { dbUser } = await readForPage(() => loadLearnerCoursesView());

  if (!dbUser) return <></>;

  return (
    <div className='px-4 py-8 lg:px-6'>
      <Card className='border-dashed'>
        <CardHeader>
          <CardTitle>Your Enrolled Courses</CardTitle>
          <CardDescription>View and manage all the courses you&apos;re currently enrolled in</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>You haven&apos;t enrolled in any courses yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
