import type { JSX, ReactNode } from 'react';

import type { QuizQuestion } from '../quiz-player-types';

// ─── Option Card ──────────────────────────────────────────────────────────────

interface OptionCardProps {
  children: ReactNode;
  isSelected: boolean;
  letter: string;
  onClick: () => void;
}

export function OptionCard({ children, isSelected, letter, onClick }: OptionCardProps): JSX.Element {
  return (
    <button
      className='group flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left text-sm text-foreground transition-all hover:border-primary/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 data-[selected=true]:font-medium data-[selected=true]:text-primary data-[selected=true]:shadow-sm dark:data-[selected=true]:bg-primary/10'
      type='button'
      data-selected={isSelected}
      onClick={onClick}
    >
      {/* Letter badge */}
      <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary group-data-[selected=true]:bg-primary group-data-[selected=true]:text-primary-foreground'>
        {letter}
      </span>
      <span className='flex-1'>{children}</span>
    </button>
  );
}

// ─── Segmented Progress ───────────────────────────────────────────────────────

interface SegmentedProgressProps {
  answers: Record<string, string | string[]>;
  currentIndex: number;
  onNavigate: (index: number) => void;
  questions: QuizQuestion[];
}

export function SegmentedProgress({
  answers,
  currentIndex,
  onNavigate,
  questions
}: SegmentedProgressProps): JSX.Element {
  return (
    <div className='flex items-center gap-0.5'>
      {questions.map((q, i) => {
        const isAnswered = q.id in answers;
        const isCurrent = i === currentIndex;
        return (
          <button
            key={q.id}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              isCurrent ? 'bg-primary' : isAnswered ? 'bg-primary/40' : 'bg-muted-foreground/20'
            }`}
            type='button'
            title={`Question ${i + 1}${isAnswered ? ' (answered)' : ''}`}
            onClick={() => onNavigate(i)}
          />
        );
      })}
    </div>
  );
}
