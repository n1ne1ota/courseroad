import type { JSX } from 'react';
import { Suspense } from 'react';

import { loadCertificatesContent } from '@/features/course/server/loaders/platform-learner-certificates';
import { CertificateGrid } from '@/features/dashboard/platform/learner/certificate-grid';
import { CertificateGridSkeleton } from '@/features/dashboard/platform/learner/certificate-grid-skeleton';
import { readForPage } from '@/server/auth/page-access';

async function CertificatesContent() {
  const { completedCourses } = await readForPage(() => loadCertificatesContent());
  return <CertificateGrid courses={completedCourses} />;
}

export default function LearnerCertificatesPage(): JSX.Element {
  return (
    <>
      <Suspense fallback={<CertificateGridSkeleton />}>
        <CertificatesContent />
      </Suspense>
    </>
  );
}
