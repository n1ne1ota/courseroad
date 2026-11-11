import { z } from 'zod';

import { QuestionType, QuizVisibility } from '@/features/quiz/question-types';

export const createQuizSchema = z.object({
    courseId: z.uuid('Invalid course ID').optional(),
    description: z.string().optional(),
    lessonId: z.uuid('Invalid lesson ID').optional(),
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long')
});

export const updateQuizSchema = z.object({
    allowedAttempts: z.coerce.number().int().min(1).max(100).optional().nullable(),
    description: z.string().optional(),
    id: z.uuid('Invalid quiz ID'),
    passingScore: z.coerce.number().int().min(0).max(100).optional().nullable(),
    showCorrectAnswers: z.boolean().optional(),
    showTimer: z.boolean().optional(),
    shuffleQuestions: z.boolean().optional(),
    thumbnailUrl: z.url().optional().nullable(),
    timeLimit: z.coerce.number().int().min(1).max(86400).optional().nullable(), // stored in seconds
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long').optional(),
    visibility: z.enum(QuizVisibility).optional()
});

export const quizOptionSchema = z.object({
    content: z.string().min(1, 'Option content is required'),
    id: z.uuid().optional(),
    isCorrect: z.boolean(),
    order: z.number().int().min(0)
});

export const quizQuestionSchema = z
    .object({
        codeLanguage: z.string().max(50).optional(),
        explanation: z.string().optional(),
        id: z.uuid().optional(),
        imageUrl: z.url().optional().nullable(),
        options: z.array(quizOptionSchema).optional(),
        order: z.number().int().min(0),
        prompt: z.string().min(1, 'Question prompt is required'),
        title: z.string().max(200, 'Title is too long').optional(),
        type: z.enum(QuestionType)
    })
    .refine(
        data => {
            if (data.type === QuestionType.SINGLE_CHOICE || data.type === QuestionType.MULTIPLE_CHOICE) {
                return data.options && data.options.length > 0;
            }
            return true;
        },
        {
            message: 'Options are required for choice questions',
            path: ['options']
        }
    )
    .refine(
        data => {
            if (data.type === QuestionType.SINGLE_CHOICE && data.options) {
                return data.options.filter(o => o.isCorrect).length === 1;
            }
            return true;
        },
        {
            message: 'Single choice questions must have exactly one correct option',
            path: ['options']
        }
    )
    .refine(
        data => {
            if (data.type === QuestionType.CUSTOM_INPUT) {
                return data.options && data.options.length > 0;
            }
            return true;
        },
        {
            message: 'Custom input questions must have at least one accepted answer',
            path: ['options']
        }
    );

export const insertQuizQuestionsSchema = z.object({
    questions: z.array(quizQuestionSchema),
    quizId: z.uuid('Invalid quiz ID')
});

// For learner submissions
export const submitQuizAnswerSchema = z.object({
    questionId: z.uuid('Invalid question ID'),
    // Array of option IDs for choice questions, or a single string for custom input
    answer: z.union([z.array(z.uuid('Invalid option ID')), z.string().min(1, 'Answer cannot be empty')])
});

export const submitQuizSchema = z.object({
    answers: z.array(submitQuizAnswerSchema),
    quizId: z.uuid('Invalid quiz ID')
});
