import { describe, expect, it, vi } from 'vitest';

import { getQuizForLearner } from '@/features/quiz/server/repositories/queries';

import type { PrismaLike } from '@/features/quiz/server/repositories/types';

describe('learner quiz projection', () => {
    it('does not select explanations or correct flags, and removes custom input answers', async () => {
        const findUnique = vi.fn().mockResolvedValue({
            id: 'quiz',
            questions: [{ id: 'custom', type: 'CUSTOM_INPUT', options: [{ id: 'secret', content: 'correct answer' }] }]
        });
        const quiz = await getQuizForLearner({ quiz: { findUnique } } as unknown as PrismaLike, 'quiz', 'learner');
        const selection = findUnique.mock.calls[0]?.[0].select.questions.select;
        expect(selection.explanation).toBeUndefined();
        expect(selection.options.select.isCorrect).toBeUndefined();
        expect(quiz?.questions[0]?.options).toEqual([]);
        expect(quiz?.questions[0]?.explanation).toBeNull();
    });
});
