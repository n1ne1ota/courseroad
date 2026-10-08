import { createMockPrismaClient } from 'tests/mocks/prisma';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCoursesWithCreators, getCourseWithCreator } from '@/features/course/server/repositories/orchestrators';

vi.mock('server-only', () => ({}));

const mockPrisma = createMockPrismaClient();

describe('Courses Orchestrator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getCoursesWithCreators', () => {
        it('should fetch published courses and merge them with their creators', async () => {
            const mockCourses = [
                { id: 'course-1', status: 'Published', title: 'Course 1', userId: 'user-1' },
                { id: 'course-2', status: 'Published', title: 'Course 2', userId: 'user-2' }
            ];
            const mockUsers = [
                { firstName: 'John', id: 'user-1', lastName: 'Doe' },
                { firstName: 'Jane', id: 'user-2', lastName: 'Smith' }
            ];

            mockPrisma.course.findMany.mockResolvedValue(mockCourses);
            mockPrisma.user.findMany.mockResolvedValue(mockUsers);

            const result = await getCoursesWithCreators(mockPrisma as any);

            expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'Published' }
                })
            );
            expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: { in: ['user-1', 'user-2'] } }
                })
            );

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                ...mockCourses[0],
                creator: mockUsers[0]
            });
            expect(result[1]).toEqual({
                ...mockCourses[1],
                creator: mockUsers[1]
            });
        });

        it('should handle empty course list correctly', async () => {
            mockPrisma.course.findMany.mockResolvedValue([]);

            const result = await getCoursesWithCreators(mockPrisma as any);

            expect(result).toHaveLength(0);
            expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
        });
    });

    describe('getCourseWithCreator', () => {
        it('should fetch a single course and merge with its creator', async () => {
            const mockCourse = { id: 'course-1', status: 'Published', title: 'Course 1', userId: 'user-1' };
            const mockUser = { firstName: 'John', id: 'user-1', lastName: 'Doe' };

            mockPrisma.course.findFirst.mockResolvedValue(mockCourse);
            mockPrisma.user.findMany.mockResolvedValue([mockUser]);

            const result = await getCourseWithCreator(mockPrisma as any, 'course-1');

            expect(mockPrisma.course.findFirst).toHaveBeenCalled();
            expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: { in: ['user-1'] } }
                })
            );

            expect(result).toEqual({
                ...mockCourse,
                creator: mockUser
            });
        });

        it('should return null if course not found', async () => {
            mockPrisma.course.findFirst.mockResolvedValue(null);

            const result = await getCourseWithCreator(mockPrisma as any, 'course-nonexistent');

            expect(result).toBeNull();
            expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
        });
    });
});
