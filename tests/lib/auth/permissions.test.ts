import { describe, expect, it } from 'vitest';

import { ac, admin, creator, learner, staff, statement } from '@/lib/auth/permissions';

describe('Permissions', () => {
    describe('Given the statement matrix', () => {
        it('includes all custom Courseroad resources', () => {
            expect(statement).toHaveProperty('course');
            expect(statement).toHaveProperty('lesson');
            expect(statement).toHaveProperty('challenge');
        });

        it('defines full CRUD actions for each custom resource', () => {
            const expectedActions = ['create', 'read', 'update', 'delete'];
            expect(statement.course).toEqual(expectedActions);
            expect(statement.lesson).toEqual(expectedActions);
            expect(statement.challenge).toEqual(expectedActions);
        });

        it('includes default Better Auth statements', () => {
            // defaultStatements includes 'user' resource from admin plugin
            expect(statement).toHaveProperty('user');
        });
    });

    describe('Given the access control instance', () => {
        it('is created successfully', () => {
            expect(ac).toBeDefined();
        });
    });

    describe('Given the learner role', () => {
        it('has read-only access to courses', () => {
            expect(learner.statements.course).toContain('read');
            expect(learner.statements.course).not.toContain('create');
            expect(learner.statements.course).not.toContain('update');
            expect(learner.statements.course).not.toContain('delete');
        });

        it('has read-only access to lessons', () => {
            expect(learner.statements.lesson).toContain('read');
            expect(learner.statements.lesson).not.toContain('create');
        });

        it('has read-only access to challenges', () => {
            expect(learner.statements.challenge).toContain('read');
            expect(learner.statements.challenge).not.toContain('create');
        });
    });

    describe('Given the creator role', () => {
        it('has full CRUD access to courses', () => {
            expect(creator.statements.course).toEqual(expect.arrayContaining(['create', 'read', 'update', 'delete']));
        });

        it('has full CRUD access to lessons', () => {
            expect(creator.statements.lesson).toEqual(expect.arrayContaining(['create', 'read', 'update', 'delete']));
        });

        it('has full CRUD access to challenges', () => {
            expect(creator.statements.challenge).toEqual(
                expect.arrayContaining(['create', 'read', 'update', 'delete'])
            );
        });
    });

    describe('Given the staff role', () => {
        it('has full CRUD access to courses', () => {
            expect(staff.statements.course).toEqual(expect.arrayContaining(['create', 'read', 'update', 'delete']));
        });

        it('has full CRUD access to lessons', () => {
            expect(staff.statements.lesson).toEqual(expect.arrayContaining(['create', 'read', 'update', 'delete']));
        });

        it('has admin statements from the admin plugin', () => {
            // Staff inherits adminAc.statements which includes user management
            expect(staff.statements).toHaveProperty('user');
        });
    });

    describe('Given the admin role', () => {
        it('has full CRUD access to courses', () => {
            expect(admin.statements.course).toEqual(expect.arrayContaining(['create', 'read', 'update', 'delete']));
        });

        it('has full CRUD access to lessons', () => {
            expect(admin.statements.lesson).toEqual(expect.arrayContaining(['create', 'read', 'update', 'delete']));
        });

        it('has full CRUD access to challenges', () => {
            expect(admin.statements.challenge).toEqual(expect.arrayContaining(['create', 'read', 'update', 'delete']));
        });

        it('has impersonate-admins permission', () => {
            expect(admin.statements.user).toContain('impersonate-admins');
        });

        it('has admin user management statements', () => {
            expect(admin.statements).toHaveProperty('user');
            expect(admin.statements.user.length).toBeGreaterThan(0);
        });
    });
});
