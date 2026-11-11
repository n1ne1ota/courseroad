import { createMockPrismaClient, type MockPrismaClient } from 'tests/mocks/prisma';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }));
vi.mock('@/server/logging/server', () => ({ log: { error: vi.fn() }, logs: { db: { error: vi.fn() } } }));
const mockRequireOrgRole = vi.fn();
vi.mock('@/server/auth/organization-context', () => ({
    getOrganizationContext: (_slug: unknown, role: string) => mockRequireOrgRole(role)
}));

// Mock tenant-scoped Prisma client
let mockPrisma: MockPrismaClient;
vi.mock('@/server/db/get-tenant-prisma', () => {
    const mock = createMockPrismaClient();
    mockPrisma = mock;
    return { getTenantPrisma: vi.fn().mockResolvedValue(mock) };
});

const { submitQuizAnswers } = await import('@/features/quiz/actions/quiz-submission-actions');

// Valid v4 UUIDs for Zod validation
const QUIZ_ID = '5e8378fe-d7a7-403d-b888-605d645c6221';
const Q1_ID = '776b73aa-53dc-4b05-a496-82c206abb6af';
const OPT_A = '31a658e1-b955-4ea5-93a1-ccee2a1ab2c2';
const OPT_B = '31a126da-ec56-41a4-b00b-be3fd15eb33c';

const mockUser = { id: 'user-1', role: 'learner' };
const initialState = { message: '', success: false };

describe('Quiz Submission Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRequireOrgRole.mockResolvedValue({
            member: { role: 'learner' },
            organizationId: 'test-org',
            user: mockUser
        });
    });

    describe('submitQuizAnswers', () => {
        it('rejects a foreign tenant quiz before recording an attempt', async () => {
            mockPrisma.quiz.findUnique.mockResolvedValue({ organizationId: 'foreign', visibility: 'PUBLIC' });
            const result = await submitQuizAnswers(initialState, { answers: [], quizId: QUIZ_ID });
            expect(result.success).toBe(false);
            expect(mockPrisma.quizSubmission.create).not.toHaveBeenCalled();
        });
        it('rejects a private quiz owned by somebody else', async () => {
            mockPrisma.quiz.findUnique.mockResolvedValue({
                organizationId: 'test-org',
                visibility: 'PRIVATE',
                userId: 'other'
            });
            const result = await submitQuizAnswers(initialState, { answers: [], quizId: QUIZ_ID });
            expect(result.success).toBe(false);
            expect(mockPrisma.quizSubmission.create).not.toHaveBeenCalled();
        });
        it('grades without exposing answer keys when feedback is disabled', async () => {
            mockPrisma.quiz.findUnique.mockResolvedValue({
                organizationId: 'test-org',
                visibility: 'PUBLIC',
                allowedAttempts: null,
                passingScore: null,
                showCorrectAnswers: false,
                id: QUIZ_ID,
                questions: [
                    {
                        id: Q1_ID,
                        type: 'SINGLE_CHOICE',
                        prompt: 'Test',
                        explanation: 'Secret explanation',
                        options: [{ id: OPT_A, content: 'Secret answer', isCorrect: true }]
                    }
                ]
            });
            const result = await submitQuizAnswers(initialState, {
                answers: [{ questionId: Q1_ID, answer: OPT_A }],
                quizId: QUIZ_ID
            });
            expect(result.data?.score).toBe(1);
            expect(result.data?.results[0]).toMatchObject({
                correctOptionIds: [],
                correctTexts: [],
                explanation: null
            });
        });
        it('returns error when unauthenticated', async () => {
            mockRequireOrgRole.mockRejectedValue(new Error('You must be logged in to submit a quiz'));
            const result = await submitQuizAnswers(initialState, {
                answers: [],
                quizId: QUIZ_ID
            });
            expect(result.success).toBe(false);
            expect(result.error).toBe('You must be logged in to submit a quiz');
        });

        it('returns validation errors for invalid data', async () => {
            const result = await submitQuizAnswers(initialState, {} as any);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Validation failed');
        });

        it('returns error when quiz not found', async () => {
            mockPrisma.quiz.findUnique.mockResolvedValue(null);
            const result = await submitQuizAnswers(initialState, {
                answers: [],
                quizId: QUIZ_ID
            });
            expect(result.success).toBe(false);
            expect(result.error).toBe('Quiz not found');
        });

        it('blocks submission when attempt limit reached', async () => {
            mockPrisma.quiz.findUnique.mockResolvedValue({
                organizationId: 'test-org',
                visibility: 'PUBLIC',
                allowedAttempts: 2,
                id: QUIZ_ID,
                passingScore: null,
                questions: []
            });
            mockPrisma.quizSubmission.count.mockResolvedValue(2);

            const result = await submitQuizAnswers(initialState, {
                answers: [],
                quizId: QUIZ_ID
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('all allowed attempts');
        });

        it('grades a single choice question correctly', async () => {
            mockPrisma.quiz.findUnique.mockResolvedValue({
                organizationId: 'test-org',
                visibility: 'PUBLIC',
                allowedAttempts: null,
                id: QUIZ_ID,
                passingScore: null,
                questions: [
                    {
                        explanation: null,
                        id: Q1_ID,
                        options: [
                            { content: '2', id: OPT_A, isCorrect: true },
                            { content: '3', id: OPT_B, isCorrect: false }
                        ],
                        prompt: 'What is 1+1?',
                        type: 'SINGLE_CHOICE'
                    }
                ]
            });
            mockPrisma.quizSubmission.create.mockResolvedValue({});

            const result = await submitQuizAnswers(initialState, {
                answers: [{ answer: OPT_A, questionId: Q1_ID }],
                quizId: QUIZ_ID
            });

            expect(result.success).toBe(true);
            expect(result.data?.score).toBe(1);
            expect(result.data?.total).toBe(1);
            expect(result.data?.results?.[0]?.correct).toBe(true);
        });

        it('grades an incorrect answer as wrong', async () => {
            mockPrisma.quiz.findUnique.mockResolvedValue({
                organizationId: 'test-org',
                visibility: 'PUBLIC',
                allowedAttempts: null,
                id: QUIZ_ID,
                passingScore: 80,
                questions: [
                    {
                        explanation: 'Basic arithmetic',
                        id: Q1_ID,
                        options: [
                            { content: '2', id: OPT_A, isCorrect: true },
                            { content: '3', id: OPT_B, isCorrect: false }
                        ],
                        prompt: 'What is 1+1?',
                        type: 'SINGLE_CHOICE'
                    }
                ]
            });
            mockPrisma.quizSubmission.create.mockResolvedValue({});

            const result = await submitQuizAnswers(initialState, {
                answers: [{ answer: OPT_B, questionId: Q1_ID }],
                quizId: QUIZ_ID
            });

            expect(result.success).toBe(true);
            expect(result.data?.score).toBe(0);
            expect(result.data?.passed).toBe(false);
        });

        it('creates a quizSubmission record with the score', async () => {
            mockPrisma.quiz.findUnique.mockResolvedValue({
                organizationId: 'test-org',
                visibility: 'PUBLIC',
                allowedAttempts: null,
                id: QUIZ_ID,
                passingScore: null,
                questions: []
            });
            mockPrisma.quizSubmission.create.mockResolvedValue({});

            await submitQuizAnswers(initialState, {
                answers: [],
                quizId: QUIZ_ID
            });

            expect(mockPrisma.quizSubmission.create).toHaveBeenCalledWith({
                data: { organizationId: 'test-org', quizId: QUIZ_ID, score: 0, userId: 'user-1' }
            });
        });
    });
});
