'use client';

import { createSSRStore } from '@/lib/store/create-ssr-store';

export interface CurriculumState {
    expandedModuleIds: string[];
}

export interface CurriculumActions {
    collapseAll: () => void;
    expandAll: (ids: string[]) => void;
    toggleModule: (id: string) => void;
}

export type CurriculumStoreType = CurriculumState & CurriculumActions;

export const {
    Context: CurriculumStoreContext,
    Provider: CurriculumStoreProvider,
    useSSRStore: useCurriculumStore
} = createSSRStore<CurriculumStoreType>(set => ({
    collapseAll: () =>
        set(() => ({
            expandedModuleIds: []
        })),
    expandAll: ids =>
        set(() => ({
            expandedModuleIds: ids
        })),
    expandedModuleIds: [],
    toggleModule: id =>
        set(state => ({
            expandedModuleIds: state.expandedModuleIds.includes(id)
                ? state.expandedModuleIds.filter(x => x !== id)
                : [...state.expandedModuleIds, id]
        }))
}));
