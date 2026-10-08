'use client';

import { useId, useMemo, useState } from 'react';

import type { ChartConfig } from '@kurume-ui/core';
import type { ColumnFiltersState, ColumnVisibilityState, SortingState } from '@tanstack/react-table';
import type { ColumnDef, Row } from '@tanstack/react-table';

import { Checkbox, showErrorToast, showToastPromise } from '@courseroad/iota-ui';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Badge,
  Button,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs
} from '@kurume-ui/core';
import { flexRender, useTable } from '@tanstack/react-table';
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  GripVerticalIcon,
  Loader2,
  MoreVerticalIcon,
  PlusIcon,
  TrendingUpIcon
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { buildCsv } from '@/features/dashboard/shared/utils/analytics-csv';
import { dashboardTableFeatures } from '@/features/dashboard/shared/utils/table-features';

import type { DashboardTableRow } from '@/features/dashboard/shared/schemas';
import type { DashboardTableFeatures } from '@/features/dashboard/shared/utils/table-features';
import type { ExportCsvColumns } from '@/types/analytics.types';

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      className='size-7 text-muted-foreground hover:bg-transparent'
      size='icon'
      variant='ghost'
    >
      <GripVerticalIcon className='size-3 text-muted-foreground' />
      <span className='sr-only'>Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<DashboardTableFeatures, DashboardTableRow>[] = [
  {
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    header: () => null,
    id: 'drag'
  },
  {
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={row.getIsSelected()}
          aria-label='Select row'
          onCheckedChange={value => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
          aria-label='Select all'
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    id: 'select'
  },
  {
    accessorKey: 'header',
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
    header: 'Header'
  },
  {
    accessorKey: 'type',
    cell: ({ row }) => (
      <div className='w-32'>
        <Badge className='px-1.5 text-muted-foreground' variant='outline'>
          {row.original.type}
        </Badge>
      </div>
    ),
    header: 'Section Type'
  },
  {
    accessorKey: 'status',
    cell: ({ row }) => (
      <Badge className='flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3' variant='outline'>
        {row.original.status === 'Done' ? (
          <CheckCircle2Icon className='text-green-500 dark:text-green-400' />
        ) : (
          <Loader2 className='size-3 animate-spin' />
        )}
        {row.original.status}
      </Badge>
    ),
    header: 'Status'
  },
  {
    accessorKey: 'target',
    cell: ({ row }) => (
      <form
        onSubmit={e => {
          e.preventDefault();
          showToastPromise(new Promise(resolve => setTimeout(resolve, 1000)), {
            error: 'Error',
            loading: `Saving ${row.original.header}`,
            success: 'Done'
          });
        }}
      >
        <Label className='sr-only' htmlFor={`${row.original.id}-target`}>
          Target
        </Label>
        <Input
          className='h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background'
          id={`${row.original.id}-target`}
          defaultValue={row.original.target}
        />
      </form>
    ),
    header: () => <div className='w-full text-right'>Target</div>
  },
  {
    accessorKey: 'limit',
    cell: ({ row }) => (
      <form
        onSubmit={event => {
          event.preventDefault();
          showToastPromise(new Promise(resolve => setTimeout(resolve, 1000)), {
            error: 'Error',
            loading: `Saving ${row.original.header}`,
            success: 'Done'
          });
        }}
      >
        <Label className='sr-only' htmlFor={`${row.original.id}-limit`}>
          Limit
        </Label>
        <Input
          className='h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background'
          id={`${row.original.id}-limit`}
          defaultValue={row.original.limit}
        />
      </form>
    ),
    header: () => <div className='w-full text-right'>Limit</div>
  },
  {
    accessorKey: 'reviewer',
    cell: ({ row }) => {
      const isAssigned = row.original.reviewer !== 'Assign reviewer';

      if (isAssigned) {
        return row.original.reviewer;
      }

      return (
        <>
          <Label className='sr-only' htmlFor={`${row.original.id}-reviewer`}>
            Reviewer
          </Label>
          <Select>
            <SelectTrigger className='h-8 w-40' id={`${row.original.id}-reviewer`}>
              <SelectValue placeholder='Assign reviewer' />
            </SelectTrigger>
            <SelectContent align='end'>
              <SelectItem value='Eddie Lake'>Eddie Lake</SelectItem>
              <SelectItem value='Jamik Tashpulatov'>Jamik Tashpulatov</SelectItem>
            </SelectContent>
          </Select>
        </>
      );
    },
    header: 'Reviewer'
  },
  {
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className='flex size-8 text-muted-foreground data-[state=open]:bg-muted' size='icon' variant='ghost'>
            <MoreVerticalIcon />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-32' align='end'>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    id: 'actions'
  }
];

const exportableColumnOrder: ExportCsvColumns = ['header', 'type', 'status', 'target', 'limit', 'reviewer'];

function DraggableRow({ row }: { row: Row<DashboardTableFeatures, DashboardTableRow> }) {
  const { isDragging, setNodeRef, transform, transition } = useSortable({
    id: row.original.id
  });

  return (
    <TableRow
      ref={setNodeRef}
      className='relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80'
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
      data-dragging={isDragging}
      data-state={row.getIsSelected() && 'selected'}
    >
      {row.getVisibleCells().map(cell => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  );
}

export function CreatorDashboardTable({ data: initialData }: { data: DashboardTableRow[] }) {
  const [data, setData] = useState(() => initialData);
  const [isExporting, setIsExporting] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  });
  const sortableId = useId();
  const [activeView, setActiveView] = useState<'outline' | 'past-performance' | 'key-personnel' | 'focus-documents'>(
    'outline'
  );
  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

  const dataIds = useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data]);

  const table = useTable({
    features: dashboardTableFeatures,
    columns,
    data,
    enableRowSelection: true,
    getRowId: row => row.id.toString(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
      sorting
    }
  });
  const visibleColumns = exportableColumnOrder.filter(columnKey => table.getColumn(columnKey)?.getIsVisible() ?? false);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData(data => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  function handleExportCsv() {
    setIsExporting(true);

    try {
      const csv = buildCsv({
        columns: visibleColumns,
        rows: data
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'creator-dashboard-export.csv';
      document.body.append(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Unable to export CSV.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className='flex w-full flex-col justify-start gap-6'>
      <div className='flex items-center justify-between px-4 lg:px-6'>
        <Label className='sr-only' htmlFor='view-selector'>
          View
        </Label>
        <div className='@4xl/main:hidden'>
          <Select defaultValue='outline'>
            <SelectTrigger className='flex w-fit' id='view-selector'>
              <SelectValue placeholder='Select a view' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='outline'>Outline</SelectItem>
              <SelectItem value='past-performance'>Past Performance</SelectItem>
              <SelectItem value='key-personnel'>Key Personnel</SelectItem>
              <SelectItem value='focus-documents'>Focus Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Tabs
          className='hidden @4xl/main:inline-flex'
          options={[
            { label: 'Outline', value: 'outline' as const },
            { label: 'Past Performance', value: 'past-performance' as const },
            { label: 'Key Personnel', value: 'key-personnel' as const },
            { label: 'Focus Documents', value: 'focus-documents' as const }
          ]}
          value={activeView}
          onValueChange={setActiveView}
        />
        <div className='flex items-center gap-2'>
          <Button
            disabled={isExporting || visibleColumns.length === 0}
            size='sm'
            variant='outline'
            onClick={handleExportCsv}
          >
            {isExporting ? <Loader2 className='animate-spin' /> : null}
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size='sm' variant='outline'>
                <ColumnsIcon />
                <span className='hidden lg:inline'>Customize Columns</span>
                <span className='lg:hidden'>Columns</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end'>
              {table
                .getAllColumns()
                .filter(column => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                .map(column => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size='sm' variant='outline'>
            <PlusIcon />
            <span className='hidden lg:inline'>Add Section</span>
          </Button>
        </div>
      </div>

      {activeView === 'outline' && (
        <div className='relative flex flex-col gap-4 overflow-auto px-4 lg:px-6'>
          <div className='overflow-hidden rounded-lg border'>
            <DndContext
              id={sortableId}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              sensors={sensors}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader className='sticky top-0 z-10 bg-muted'>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => {
                        return (
                          <TableHead key={header.id} colSpan={header.colSpan}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className='**:data-[slot=table-cell]:first:w-8'>
                  {table.getRowModel().rows?.length ? (
                    <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                      {table.getRowModel().rows.map(row => (
                        <DraggableRow key={row.id} row={row} />
                      ))}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell className='h-24 text-center' colSpan={columns.length}>
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>
          <div className='flex items-center justify-between px-4'>
            <div className='hidden flex-1 text-sm text-muted-foreground lg:flex'>
              {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row
              {table.getFilteredSelectedRowModel().rows.length === 1 ? '' : 's'} selected.
            </div>
            <div className='flex w-full items-center gap-8 lg:w-fit'>
              <div className='hidden items-center gap-2 lg:flex'>
                <Label className='text-sm font-medium' htmlFor='rows-per-page'>
                  Rows per page
                </Label>
                <Select
                  value={`${table.state.pagination.pageSize}`}
                  onValueChange={value => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className='w-20' id='rows-per-page'>
                    <SelectValue placeholder={table.state.pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side='top'>
                    {[10, 20, 30, 40, 50].map(pageSize => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='flex w-fit items-center justify-center text-sm font-medium'>
                Page {table.state.pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <div className='ml-auto flex items-center gap-2 lg:ml-0'>
                <Button
                  className='hidden h-8 w-8 p-0 lg:flex'
                  disabled={!table.getCanPreviousPage()}
                  variant='outline'
                  onClick={() => table.setPageIndex(0)}
                >
                  <span className='sr-only'>Go to first page</span>
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  className='size-8'
                  disabled={!table.getCanPreviousPage()}
                  size='icon'
                  variant='outline'
                  onClick={() => table.previousPage()}
                >
                  <span className='sr-only'>Go to previous page</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  className='size-8'
                  disabled={!table.getCanNextPage()}
                  size='icon'
                  variant='outline'
                  onClick={() => table.nextPage()}
                >
                  <span className='sr-only'>Go to next page</span>
                  <ChevronRightIcon />
                </Button>
                <Button
                  className='hidden size-8 lg:flex'
                  disabled={!table.getCanNextPage()}
                  size='icon'
                  variant='outline'
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                >
                  <span className='sr-only'>Go to last page</span>
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'past-performance' && (
        <div className='flex flex-col px-4 lg:px-6'>
          <div className='aspect-video w-full flex-1 rounded-lg border border-dashed' />
        </div>
      )}
      {activeView === 'key-personnel' && (
        <div className='flex flex-col px-4 lg:px-6'>
          <div className='aspect-video w-full flex-1 rounded-lg border border-dashed' />
        </div>
      )}
      {activeView === 'focus-documents' && (
        <div className='flex flex-col px-4 lg:px-6'>
          <div className='aspect-video w-full flex-1 rounded-lg border border-dashed' />
        </div>
      )}
    </div>
  );
}

const chartData = [
  { desktop: 186, mobile: 80, month: 'January' },
  { desktop: 305, mobile: 200, month: 'February' },
  { desktop: 237, mobile: 120, month: 'March' },
  { desktop: 73, mobile: 190, month: 'April' },
  { desktop: 209, mobile: 130, month: 'May' },
  { desktop: 214, mobile: 140, month: 'June' }
];

const chartConfig = {
  desktop: {
    color: 'var(--primary)',
    label: 'Desktop'
  },
  mobile: {
    color: 'var(--primary)',
    label: 'Mobile'
  }
} satisfies ChartConfig;

function TableCellViewer({ item }: { item: DashboardTableRow }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className='w-fit px-0 text-left hover:bg-transparent hover:underline' variant='ghost'>
          {item.header}
        </Button>
      </SheetTrigger>
      <SheetContent className='@container/sheet flex flex-col' side='right'>
        <SheetHeader className='gap-1'>
          <SheetTitle>{item.header}</SheetTitle>
          <SheetDescription>Showing total visitors for the last 6 months</SheetDescription>
        </SheetHeader>
        <div className='flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm'>
          <div className='hidden space-y-4 @sm/sheet:block'>
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                margin={{
                  left: 0,
                  right: 10
                }}
                data={chartData}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  hide
                  axisLine={false}
                  dataKey='month'
                  tickFormatter={value => value.slice(0, 3)}
                  tickLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent indicator='dot' />} cursor={false} />
                <Area
                  type='natural'
                  dataKey='mobile'
                  fill='var(--color-mobile)'
                  fillOpacity={0.6}
                  stackId='a'
                  stroke='var(--color-mobile)'
                />
                <Area
                  type='natural'
                  dataKey='desktop'
                  fill='var(--color-desktop)'
                  fillOpacity={0.4}
                  stackId='a'
                  stroke='var(--color-desktop)'
                />
              </AreaChart>
            </ChartContainer>
            <Separator />
            <div className='grid gap-2'>
              <div className='flex gap-2 leading-none font-medium'>
                Trending up by 5.2% this month <TrendingUpIcon className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Showing total visitors for the last 6 months. This is just some random text to test the layout. It spans
                multiple lines and should wrap around.
              </div>
            </div>
            <Separator />
          </div>
          <form className='flex flex-col gap-4'>
            <div className='flex flex-col gap-3'>
              <Label htmlFor='header'>Header</Label>
              <Input id='header' defaultValue={item.header} />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-3'>
                <Label htmlFor='type'>Type</Label>
                <Select defaultValue={item.type}>
                  <SelectTrigger className='w-full' id='type'>
                    <SelectValue placeholder='Select a type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Table of Contents'>Table of Contents</SelectItem>
                    <SelectItem value='Executive Summary'>Executive Summary</SelectItem>
                    <SelectItem value='Technical Approach'>Technical Approach</SelectItem>
                    <SelectItem value='Design'>Design</SelectItem>
                    <SelectItem value='Capabilities'>Capabilities</SelectItem>
                    <SelectItem value='Focus Documents'>Focus Documents</SelectItem>
                    <SelectItem value='Narrative'>Narrative</SelectItem>
                    <SelectItem value='Cover Page'>Cover Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex flex-col gap-3'>
                <Label htmlFor='status'>Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger className='w-full' id='status'>
                    <SelectValue placeholder='Select a status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Done'>Done</SelectItem>
                    <SelectItem value='In Progress'>In Progress</SelectItem>
                    <SelectItem value='Not Started'>Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-3'>
                <Label htmlFor='target'>Target</Label>
                <Input id='target' defaultValue={item.target} />
              </div>
              <div className='flex flex-col gap-3'>
                <Label htmlFor='limit'>Limit</Label>
                <Input id='limit' defaultValue={item.limit} />
              </div>
            </div>
            <div className='flex flex-col gap-3'>
              <Label htmlFor='reviewer'>Reviewer</Label>
              <Select defaultValue={item.reviewer}>
                <SelectTrigger className='w-full' id='reviewer'>
                  <SelectValue placeholder='Select a reviewer' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Eddie Lake'>Eddie Lake</SelectItem>
                  <SelectItem value='Jamik Tashpulatov'>Jamik Tashpulatov</SelectItem>
                  <SelectItem value='Emily Whalen'>Emily Whalen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <SheetFooter className='mt-auto flex gap-2 sm:flex-col sm:space-x-0'>
          <Button className='w-full'>Submit</Button>
          <SheetClose asChild>
            <Button className='w-full' variant='outline'>
              Done
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
