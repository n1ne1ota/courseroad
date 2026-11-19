import { EnrollmentVerifier } from './_components/enrollment-verifier';

export default async function SuccessPage(props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;

  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/10 p-4 md:p-8'>
      <div className='border-default-200/50 w-full max-w-2xl rounded-xl border bg-background p-8 shadow-sm'>
        <EnrollmentVerifier key={params.courseId} courseId={params.courseId} />
      </div>
    </div>
  );
}
