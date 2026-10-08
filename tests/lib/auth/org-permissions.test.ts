import { describe, expect, it } from 'vitest';

import { orgCreator, orgInstructor, orgLearner, orgManager, orgOwner } from '@/lib/auth/org-permissions';

describe('org-permissions', () => {
    // ──────────────────────────────────────────────────────
    // Given: the owner role
    // ──────────────────────────────────────────────────────

    describe('orgOwner', () => {
        it('should have full course CRUD permissions', () => {
            expect(orgOwner.statements.course).toContain('create');
            expect(orgOwner.statements.course).toContain('read');
            expect(orgOwner.statements.course).toContain('update');
            expect(orgOwner.statements.course).toContain('delete');
        });

        it('should have full lesson CRUD permissions', () => {
            expect(orgOwner.statements.lesson).toContain('create');
            expect(orgOwner.statements.lesson).toContain('read');
            expect(orgOwner.statements.lesson).toContain('update');
            expect(orgOwner.statements.lesson).toContain('delete');
        });

        it('should have full challenge CRUD permissions', () => {
            expect(orgOwner.statements.challenge).toContain('create');
            expect(orgOwner.statements.challenge).toContain('read');
            expect(orgOwner.statements.challenge).toContain('update');
            expect(orgOwner.statements.challenge).toContain('delete');
        });
    });

    // ──────────────────────────────────────────────────────
    // Given: the manager role
    // ──────────────────────────────────────────────────────

    describe('orgManager', () => {
        it('should have read-only course/lesson/challenge permissions', () => {
            expect(orgManager.statements.course).toEqual(['read']);
            expect(orgManager.statements.lesson).toEqual(['read']);
            expect(orgManager.statements.challenge).toEqual(['read']);
        });

        it('should have member management permissions', () => {
            expect(orgManager.statements.member).toContain('create');
            expect(orgManager.statements.member).toContain('update');
            expect(orgManager.statements.member).toContain('delete');
        });

        it('should have invitation management permissions', () => {
            expect(orgManager.statements.invitation).toContain('create');
            expect(orgManager.statements.invitation).toContain('cancel');
        });

        it('should be able to update the organization', () => {
            expect(orgManager.statements.organization).toContain('update');
        });
    });

    // ──────────────────────────────────────────────────────
    // Given: the creator role
    // ──────────────────────────────────────────────────────

    describe('orgCreator', () => {
        it('should have full course CRUD permissions', () => {
            expect(orgCreator.statements.course).toContain('create');
            expect(orgCreator.statements.course).toContain('read');
            expect(orgCreator.statements.course).toContain('update');
            expect(orgCreator.statements.course).toContain('delete');
        });

        it('should have full lesson CRUD permissions', () => {
            expect(orgCreator.statements.lesson).toContain('create');
            expect(orgCreator.statements.lesson).toContain('read');
            expect(orgCreator.statements.lesson).toContain('update');
            expect(orgCreator.statements.lesson).toContain('delete');
        });

        it('should have full challenge CRUD permissions', () => {
            expect(orgCreator.statements.challenge).toContain('create');
            expect(orgCreator.statements.challenge).toContain('read');
            expect(orgCreator.statements.challenge).toContain('update');
            expect(orgCreator.statements.challenge).toContain('delete');
        });

        it('should NOT have member management permissions', () => {
            expect((orgCreator.statements as any).member).toBeUndefined();
        });

        it('should NOT have organization update permissions', () => {
            expect((orgCreator.statements as any).organization).toBeUndefined();
        });
    });

    // ──────────────────────────────────────────────────────
    // Given: the instructor role
    // ──────────────────────────────────────────────────────

    describe('orgInstructor', () => {
        it('should have read course/lesson permissions', () => {
            expect(orgInstructor.statements.course).toEqual(['read']);
            expect(orgInstructor.statements.lesson).toEqual(['read']);
        });

        it('should have read and update challenge permissions for grading', () => {
            expect(orgInstructor.statements.challenge).toContain('read');
            expect(orgInstructor.statements.challenge).toContain('update');
            expect(orgInstructor.statements.challenge).not.toContain('create');
            expect(orgInstructor.statements.challenge).not.toContain('delete');
        });

        it('should NOT have member management permissions', () => {
            expect((orgInstructor.statements as any).member).toBeUndefined();
        });
    });

    // ──────────────────────────────────────────────────────
    // Given: the learner role
    // ──────────────────────────────────────────────────────

    describe('orgLearner', () => {
        it('should have read-only course access', () => {
            expect(orgLearner.statements.course).toEqual(['read']);
        });

        it('should have read-only lesson access', () => {
            expect(orgLearner.statements.lesson).toEqual(['read']);
        });

        it('should have read-only challenge access', () => {
            expect(orgLearner.statements.challenge).toEqual(['read']);
        });

        it('should NOT be able to create courses', () => {
            expect(orgLearner.statements.course).not.toContain('create');
        });

        it('should NOT be able to delete courses', () => {
            expect(orgLearner.statements.course).not.toContain('delete');
        });

        it('should NOT have member management permissions', () => {
            expect((orgLearner.statements as any).member).toBeUndefined();
        });
    });
});
