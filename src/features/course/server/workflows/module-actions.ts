import 'server-only';

import {
    createModuleSchema,
    deleteModuleSchema,
    reorderModulesSchema,
    updateModuleSchema
} from '@/features/course/schemas/module-schemas';
import { executeOrganizationCurriculum } from '@/features/course/server/workflows/curriculum-actions';
import {
    legacyOrderedIds,
    organizationModule,
    savedRecord
} from '@/features/course/server/workflows/legacy-curriculum';
import { createTenantAction } from '@/server/actions/create-tenant-action';

export const createModule = createTenantAction('creator', createModuleSchema, async (data, ctx) => {
    const result = await executeOrganizationCurriculum({ ...data, operation: 'createModule' }, ctx);
    return savedRecord(result.modules.at(-1));
});
export const updateModule = createTenantAction('creator', updateModuleSchema, async (data, ctx) => {
    const courseModule = await organizationModule(data.moduleId, ctx.organizationId);
    const result = await executeOrganizationCurriculum(
        { ...data, courseId: courseModule.courseId, operation: 'updateModule' },
        ctx
    );
    return savedRecord(result.modules.find(row => row.id === courseModule.id));
});
export const deleteModule = createTenantAction('creator', deleteModuleSchema, async (data, ctx) => {
    const courseModule = await organizationModule(data.moduleId, ctx.organizationId);
    await executeOrganizationCurriculum({ ...data, courseId: courseModule.courseId, operation: 'deleteModule' }, ctx);
    return true;
});
export const reorderModules = createTenantAction('creator', reorderModulesSchema, async (data, ctx) => {
    if (!data[0]) return true;
    const ids = legacyOrderedIds(data);
    const courseModule = await organizationModule(data[0].id, ctx.organizationId);
    await executeOrganizationCurriculum({ courseId: courseModule.courseId, operation: 'reorderModules', ids }, ctx);
    return true;
});
