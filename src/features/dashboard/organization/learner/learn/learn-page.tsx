import 'server-only';

import { LearnRedirectView as getLearningDestination } from '@/features/course/server/loaders/organization-learner-learn-redirect';
import { readForPage } from '@/server/auth/page-access';
type LearnRedirectViewProps = {
  courseId: string;
  slug: string;
};

export async function LearnRedirectView(props: LearnRedirectViewProps) {
  return readForPage(() => getLearningDestination(props));
}
