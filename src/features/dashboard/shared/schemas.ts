import { z } from 'zod';

// Section type enum based on actual data
export const sectionTypeEnum = z.enum([
    'Cover page',
    'Table of contents',
    'Narrative',
    'Technical content',
    'Plain language',
    'Legal',
    'Visual',
    'Financial',
    'Research',
    'Planning'
]);

// Status enum
export const statusEnum = z.enum(['Done', 'In Progress', 'Not Started']);

// Dashboard table row schema
export const dashboardTableSchema = z.object({
    header: z.string().min(1, 'Header is required'),
    id: z.number().int().positive(),
    limit: z.string().min(1, 'Limit is required'),
    reviewer: z.string().min(1, 'Reviewer is required'),
    status: statusEnum,
    target: z.string().min(1, 'Target is required'),
    type: sectionTypeEnum
});

// Type inference
export type DashboardTableRow = z.infer<typeof dashboardTableSchema>;
export type SectionType = z.infer<typeof sectionTypeEnum>;
export type Status = z.infer<typeof statusEnum>;
