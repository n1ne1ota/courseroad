import type { QuestionType, QuizVisibility } from './question-types';

export type Quiz = {
    id: string;
    userId: string;
    organizationId: string | null;
    title: string;
    description: string | null;
    courseId: string | null;
    lessonId: string | null;
    visibility: QuizVisibility;
    timeLimit: number | null;
    allowedAttempts: number | null;
    passingScore: number | null;
    shuffleQuestions: boolean;
    showCorrectAnswers: boolean;
    showTimer: boolean;
    thumbnailUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
};
/** Editor-only projections include grading keys; learner types are separate. */
export type QuizQuestion = {
    id: string;
    quizId: string;
    organizationId: string | null;
    type: QuestionType;
    title: string | null;
    prompt: string;
    explanation: string | null;
    codeLanguage: string | null;
    imageUrl: string | null;
    order: number;
    createdAt: Date;
    updatedAt: Date;
};
export type QuizOption = {
    id: string;
    questionId: string;
    organizationId: string | null;
    content: string;
    isCorrect: boolean;
    order: number;
};
