import type { QuestionType } from '@/features/quiz/question-types';
import type { SubmitQuizResult } from '@/features/quiz/submission-types';
import type { ActionState } from '@/types/action.types';

// Types
export type QuizOption = { id: string; content: string; order: number };

/** Payload dispatched to a quiz-submission form action. */
export type QuizSubmitPayload = {
    quizId: string;
    answers: { questionId: string; answer: string | string[] }[];
};

/** A `useActionState`-compatible quiz-submission server action. */
export type QuizSubmitAction = (
    prevState: ActionState<SubmitQuizResult>,
    payload: QuizSubmitPayload
) => Promise<ActionState<SubmitQuizResult>>;

export type QuizQuestion = {
    id: string;
    type: QuestionType;
    title: string | null;
    prompt: string;
    explanation: string | null;
    imageUrl: string | null;
    codeLanguage: string | null;
    options: QuizOption[];
};

export type QuizData = {
    id: string;
    title: string;
    description: string | null;
    questions: QuizQuestion[];
};

export interface QuizPlayerProps {
    attemptsRemaining: number | null;
    passingScore: number | null;
    quiz: QuizData;
    showCorrectAnswers: boolean;
    timeLimit: number | null;
    /**
     * Server action used to submit answers. Defaults to the org-scoped
     * `submitQuizAnswers`; the public demo passes `submitPublicQuizAnswers`.
     */
    submitAction?: QuizSubmitAction;
    /**
     * Optional guard run before submitting. Return `false` to abort the submit
     * (e.g. if guest sign-in failed). Used to create an anonymous session for
     * the public demo quiz.
     */
    ensureSession?: () => Promise<boolean>;
    /** Where the results screen "Back" button navigates. */
    resultsBackHref?: string;
}

// Constants
/** Letter labels for option cards. */
export const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Utilities
/** Format seconds as MM:SS. */
export function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Strip a leading heading (`<h1>`–`<h4>`) from HTML if its text content
 * matches the given title. Prevents the quiz title from appearing twice
 * when the description HTML echoes it as a heading.
 */
export function stripLeadingTitle(html: string, title: string): string {
    const match = html.match(/^\s*<(h[1-4])\b[^>]*>(.*?)<\/\1>\s*/is);
    if (!match) return html;

    const headingText = (match[2] ?? '').replace(/<[^>]*>/g, '').trim();
    if (headingText.toLowerCase() === title.trim().toLowerCase()) {
        return html.slice(match[0].length);
    }
    return html;
}
