import { createMockPrismaClient } from 'tests/mocks/prisma';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getLearnerQuizzesWithStats } from '@/features/quiz/server/repositories/orchestrators';

vi.mock('server-only', () => ({}));

const mockPrisma = createMockPrismaClient();

describe('Quizzes Orchestrator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getLearnerQuizzesWithStats', () => {
        it('should retrieve learner quizzes and compute metrics and stats correctly', async () => {
            const mockQuizzes = [
                {
                    id: 'quiz-1',
                    questions: [{ id: 'q-1' }, { id: 'q-2' }],
                    submissions: [
                        { createdAt: new Date('2026-05-01'), id: 'sub-1', score: 2 },
                        { createdAt: new Date('2026-04-01'), id: 'sub-2', score: 1 }
                    ],
                    title: 'Quiz 1'
                },
                {
                    id: 'quiz-2',
                    questions: [{ id: 'q-3' }],
                    submissions: [],
                    title: 'Quiz 2'
                }
            ];

            mockPrisma.quiz.findMany.mockResolvedValue(mockQuizzes);

            const result = await getLearnerQuizzesWithStats(mockPrisma as any, 'user-1', ['course-1']);

            expect(mockPrisma.quiz.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: [{ courseId: { in: ['course-1'] } }, { courseId: null, lessonId: null }]
                    })
                })
            );

            expect(result).toHaveLength(2);

            // Quiz 1 with attempts
            expect(result[0]).toEqual(
                expect.objectContaining({
                    attemptCount: 2,
                    bestPct: 100,
                    bestScore: 2,
                    id: 'quiz-1',
                    lastAttempt: (mockQuizzes[0] as any).submissions[0],
                    questionsCount: 2
                })
            );

            // Quiz 2 without attempts
            expect(result[1]).toEqual(
                expect.objectContaining({
                    attemptCount: 0,
                    bestPct: null,
                    bestScore: null,
                    id: 'quiz-2',
                    lastAttempt: null,
                    questionsCount: 1
                })
            );
        });
    });
});
