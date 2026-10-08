import { useTable } from '@tanstack/react-table';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { dashboardTableFeatures } from '@/features/dashboard/shared/utils/table-features';

const data = [
  { id: 'a', name: 'Alice', score: 2 },
  { id: 'b', name: 'Bob', score: 3 },
  { id: 'c', name: 'Alex', score: 1 }
];
const columns = [{ accessorKey: 'name' }, { accessorKey: 'score' }];

describe('dashboard table features', () => {
  it('filters and sorts rows before pagination and provides faceted values', () => {
    const { result } = renderHook(() =>
      useTable({
        columns,
        data,
        features: dashboardTableFeatures,
        initialState: {
          columnFilters: [{ id: 'name', value: 'Al' }],
          pagination: { pageIndex: 0, pageSize: 1 },
          sorting: [{ desc: false, id: 'score' }]
        }
      })
    );

    expect(result.current.getCoreRowModel().rows).toHaveLength(3);
    expect(result.current.getFilteredRowModel().rows).toHaveLength(2);
    expect(result.current.getRowModel().rows[0]?.original.name).toBe('Alex');
    expect(result.current.getPageCount()).toBe(2);
    expect(result.current.getColumn('name')?.getFacetedUniqueValues().size).toBe(3);

    act(() => result.current.nextPage());

    expect(result.current.state.pagination.pageIndex).toBe(1);
    expect(result.current.getRowModel().rows[0]?.original.name).toBe('Alice');
  });

  it('updates row selection and column visibility', () => {
    const { result } = renderHook(() =>
      useTable({ columns, data, features: dashboardTableFeatures, getRowId: row => row.id })
    );

    act(() => {
      result.current.getRow('a').toggleSelected(true);
      result.current.getColumn('score')?.toggleVisibility(false);
    });

    expect(result.current.getFilteredSelectedRowModel().rows.map(row => row.id)).toEqual(['a']);
    expect(result.current.getVisibleLeafColumns().map(column => column.id)).toEqual(['name']);
  });

  it('keeps server-paginated user rows intact and uses the supplied page count', () => {
    const { result } = renderHook(() =>
      useTable({
        columns,
        data,
        features: dashboardTableFeatures,
        initialState: { pagination: { pageIndex: 0, pageSize: 1 } },
        manualPagination: true,
        pageCount: 5
      })
    );

    expect(result.current.getRowModel().rows).toHaveLength(3);
    expect(result.current.getPageCount()).toBe(5);
  });
});
