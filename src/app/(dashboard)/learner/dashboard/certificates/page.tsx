import type { JSX } from 'react';
import { Suspense } from 'react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { loadCertificatesContent } from '@/features/course/server/loaders/platform-learner-certificates';
import { CertificateGrid } from '@/features/dashboard/platform/learner/certificate-grid';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';
import { readForPage } from '@/server/auth/page-access';

async function CertificatesContent() {
  const { completedCourses } = await readForPage(() => loadCertificatesContent());

  return (
    <div className='px-4 pt-6 pb-12 lg:px-6'>
      <CertificateGrid courses={completedCourses} />
    </div>
  );
}

export default function LearnerCertificatesPage(): JSX.Element {
  return (
    <DashboardPlatformLayout role='learner' title='My Credentials'>
      <Suspense fallback={<PageSkeleton />}>
        <CertificatesContent />
      </Suspense>
    </DashboardPlatformLayout>
  );
}
