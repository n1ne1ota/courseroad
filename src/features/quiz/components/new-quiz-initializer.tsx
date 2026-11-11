'use client';
import { useEffect, useRef, useState } from 'react';

import { createQuiz } from '@/features/quiz/actions/quiz-actions';

/** Draft creation occurs through an action, so route prefetch cannot create records. */
export function NewQuizInitializer() {
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void createQuiz(null as never, { title: 'Untitled Quiz' })
      .then(result => {
        if (!result.success) setError(result.error ?? 'Unable to create quiz.');
      })
      .catch(() => setError('Unable to create quiz.'));
  }, []);
  return <p role={error ? 'alert' : 'status'}>{error ?? 'Preparing your quiz…'}</p>;
}
