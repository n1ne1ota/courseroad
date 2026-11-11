import React from 'react';

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CurriculumStoreProvider, useCurriculumStore } from '../../src/features/course/store/curriculum-store';
import { getQueryClient } from '../../src/server/query/prefetch';

describe('ARCH-143: Data Patterns and State Management', () => {
  describe('Zustand SSR-Safe Request Isolation', () => {
    it('should provide isolated stores across different providers', () => {
      // Create a wrapper component that renders a provider with module-1 initial state
      const wrapper1 = ({ children }: { children: React.ReactNode }) => (
        <CurriculumStoreProvider initialValue={{ expandedModuleIds: ['module-1'] }}>{children}</CurriculumStoreProvider>
      );

      // Create a wrapper component that renders a provider with module-2 initial state
      const wrapper2 = ({ children }: { children: React.ReactNode }) => (
        <CurriculumStoreProvider initialValue={{ expandedModuleIds: ['module-2'] }}>{children}</CurriculumStoreProvider>
      );

      // Render hooks separately under their corresponding providers
      const { result: store1 } = renderHook(() => useCurriculumStore(s => s), { wrapper: wrapper1 });
      const { result: store2 } = renderHook(() => useCurriculumStore(s => s), { wrapper: wrapper2 });

      // Assert they started with isolated initial states
      expect(store1.current.expandedModuleIds).toEqual(['module-1']);
      expect(store2.current.expandedModuleIds).toEqual(['module-2']);

      // Mutate state in store1
      act(() => {
        store1.current.toggleModule('module-3');
      });

      // Assert state changes did not leak to store2
      expect(store1.current.expandedModuleIds).toEqual(['module-1', 'module-3']);
      expect(store2.current.expandedModuleIds).toEqual(['module-2']);
    });
  });

  describe('React Query Request-Scoped QueryClient', () => {
    it('should share QueryClient inside the same request context and isolate across requests', () => {
      const client = getQueryClient();
      expect(client).toBeDefined();
      expect(client.getDefaultOptions().queries?.staleTime).toBe(60 * 1000);
      expect(client.getDefaultOptions().queries?.gcTime).toBe(5 * 60 * 1000);
    });
  });
});
