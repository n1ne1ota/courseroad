import { B2CLearnRedirectPage as B2CLearnRedirectPageData } from '@/features/course/server/loaders/platform-learner-learn-course';
import { readForPage } from '@/server/auth/page-access';

type PageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function B2CLearnRedirectPage(props: PageProps) {
  return readForPage(() => B2CLearnRedirectPageData(props));
}
