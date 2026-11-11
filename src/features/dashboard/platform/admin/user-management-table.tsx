'use client';

import { useState, useTransition } from 'react';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { ColumnDef, ColumnVisibilityState } from '@tanstack/react-table';

import { Checkbox } from '@kurume-ui/core';
import { Avatar, AvatarFallback, AvatarImage } from '@kurume-ui/core';
import { Button } from '@kurume-ui/core';
import { SearchInput } from '@kurume-ui/core';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@kurume-ui/core';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kurume-ui/core';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kurume-ui/core';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@kurume-ui/core';
import { flexRender, useTable } from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  InfoIcon,
  Loader2,
  ShieldCheckIcon,
  Trash2Icon
} from 'lucide-react';

import type { UserRole } from '@/lib/utils/auth-navigation';

import { bulkDeleteUsers, bulkUpdateUserRoles } from '@/features/auth/actions/admin-actions';
import { dashboardTableFeatures } from '@/features/dashboard/shared/utils/table-features';

import type { DashboardTableFeatures } from '@/features/dashboard/shared/utils/table-features';

import { RoleUpdateDropdown } from './role-update-dropdown';
import { UserRoleBadge } from './user-role-badge';

export type ManagementUser = {
  id: string;
  uid: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  hasPaidActivationFee: boolean;
};

interface UserManagementTableProps {
  sortField: string;
  sortOrder: 'asc' | 'desc';
  totalCount: number;
  totalPages: number;
  users: ManagementUser[];
}

const ROLE_OPTIONS = [
  { label: 'All Roles', value: 'ALL' },
  { label: 'Admin', value: 'admin' },
  { label: 'Staff', value: 'staff' },
  { label: 'Creator', value: 'creator' },
  { label: 'Learner', value: 'learner' }
];

const BULK_ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Staff', value: 'staff' },
  { label: 'Creator', value: 'creator' },
  { label: 'Learner', value: 'learner' }
];

function SortIcon({
  currentField,
  currentOrder,
  field
}: {
  field: string;
  currentField: string;
  currentOrder: 'asc' | 'desc';
}) {
  if (field !== currentField) return <ArrowUpDownIcon className='ml-1.5 h-3.5 w-3.5 opacity-40' />;
  return currentOrder === 'asc' ? (
    <ArrowUpIcon className='ml-1.5 h-3.5 w-3.5' />
  ) : (
    <ArrowDownIcon className='ml-1.5 h-3.5 w-3.5' />
  );
}

export function UserManagementTable({ sortField, sortOrder, totalCount, totalPages, users }: UserManagementTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isBulkPending, startBulkTransition] = useTransition();

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentSearch = searchParams.get('search') || '';
  const currentRole = searchParams.get('role') || '';

  const [searchValue, setSearchValue] = useState(currentSearch);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [bulkError, setBulkError] = useState<string | null>(null);

  const updateQueryParams = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'ALL') newParams.delete(key);
      else newParams.set(key, value);
    });

    if (!params.page && (params.search !== undefined || params.role !== undefined)) {
      newParams.delete('page');
    }

    startTransition(() => {
      router.push(`${pathname}?${newParams.toString()}` as Route);
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle order if same field
      updateQueryParams({
        page: null,
        sortField: field,
        sortOrder: sortOrder === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // New field, default desc
      updateQueryParams({ page: null, sortField: field, sortOrder: 'desc' });
    }
  };

  const handleSearchSubmit = () => {
    if (searchValue !== currentSearch) {
      updateQueryParams({ search: searchValue });
    }
  };

  const getSelectedUserIds = (): string[] => {
    return table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
  };

  const handleBulkAssignRole = (targetRole: UserRole) => {
    setBulkError(null);
    const ids = getSelectedUserIds();
    if (!ids.length) return;
    startBulkTransition(async () => {
      const result = await bulkUpdateUserRoles({ targetRole, userIds: ids });
      if (!result.success) {
        setBulkError(result.error || 'Something went wrong');
      } else {
        setRowSelection({});
      }
    });
  };

  const handleBulkDelete = () => {
    setBulkError(null);
    const ids = getSelectedUserIds();
    if (!ids.length) return;
    startBulkTransition(async () => {
      const result = await bulkDeleteUsers({ userIds: ids });
      if (!result.success) {
        setBulkError(result.error || 'Something went wrong');
      } else {
        setRowSelection({});
      }
    });
  };

  const columns: ColumnDef<DashboardTableFeatures, ManagementUser>[] = [
    {
      cell: ({ row }) => (
        <div className='flex items-center justify-center px-2'>
          <Checkbox
            isSelected={row.getIsSelected()}
            aria-label='Select row'
            onValueChange={value => row.toggleSelected(!!value)}
          />
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
      header: ({ table }) => (
        <div className='flex items-center justify-center px-2'>
          <Checkbox
            isIndeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
            isSelected={table.getIsAllPageRowsSelected()}
            aria-label='Select all'
            onValueChange={value => table.toggleAllPageRowsSelected(!!value)}
          />
        </div>
      ),
      id: 'select'
    },
    {
      accessorKey: 'uid',
      cell: ({ row }) => <span className='text-muted-foreground'>#{row.original.uid}</span>,
      header: () => (
        <button
          className='flex cursor-pointer items-center transition-colors select-none hover:text-foreground'
          onClick={() => handleSort('uid')}
        >
          UID
          <SortIcon currentField={sortField} currentOrder={sortOrder} field='uid' />
        </button>
      )
    },
    {
      accessorKey: 'user',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className='flex items-center gap-3'>
            <Avatar className='h-9 w-9'>
              {user.image && <AvatarImage alt={user.username} src={user.image} />}
              <AvatarFallback>
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span className='font-medium'>
                {user.firstName} {user.lastName}
              </span>
              <span className='text-xs text-muted-foreground'>{user.username}</span>
            </div>
          </div>
        );
      },
      header: () => (
        <button
          className='flex cursor-pointer items-center transition-colors select-none hover:text-foreground'
          onClick={() => handleSort('firstName')}
        >
          User
          <SortIcon currentField={sortField} currentOrder={sortOrder} field='firstName' />
        </button>
      )
    },
    {
      accessorKey: 'email',
      cell: ({ row }) => <span className='text-sm'>{row.original.email}</span>,
      header: () => (
        <button
          className='flex cursor-pointer items-center transition-colors select-none hover:text-foreground'
          onClick={() => handleSort('email')}
        >
          E-Mail
          <SortIcon currentField={sortField} currentOrder={sortOrder} field='email' />
        </button>
      )
    },
    {
      accessorKey: 'role',
      cell: ({ row }) => <UserRoleBadge role={row.original.role} />,
      header: () => (
        <button
          className='flex cursor-pointer items-center transition-colors select-none hover:text-foreground'
          onClick={() => handleSort('role')}
        >
          Role
          <SortIcon currentField={sortField} currentOrder={sortOrder} field='role' />
        </button>
      )
    },
    {
      accessorKey: 'createdAt',
      cell: ({ row }) => <span className='text-sm'>{new Date(row.original.createdAt).toLocaleDateString()}</span>,
      header: () => (
        <button
          className='flex cursor-pointer items-center transition-colors select-none hover:text-foreground'
          onClick={() => handleSort('createdAt')}
        >
          Date Joined
          <SortIcon currentField={sortField} currentOrder={sortOrder} field='createdAt' />
        </button>
      )
    },
    {
      cell: ({ row }) => (
        <div className='flex justify-end px-4'>
          <RoleUpdateDropdown currentRole={row.original.role} userId={row.original.id} />
        </div>
      ),
      header: () => <div className='w-full px-4 text-right'>Actions</div>,
      id: 'actions'
    }
  ];

  const table = useTable({
    features: dashboardTableFeatures,
    columns,
    data: users,
    manualPagination: true,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    pageCount: totalPages,
    state: {
      columnVisibility,
      rowSelection
    }
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  // Compute a role breakdown string for selected rows, e.g. "2 Learners · 1 Creator"
  const selectedRoleBreakdown = (() => {
    if (selectedCount === 0) return '';
    const counts: Partial<Record<UserRole, number>> = {};
    for (const row of table.getFilteredSelectedRowModel().rows) {
      const role = row.original.role;
      counts[role] = (counts[role] ?? 0) + 1;
    }
    const ROLE_LABELS: Record<UserRole, string> = {
      admin: 'Admin',
      creator: 'Creator',
      learner: 'Learner',
      staff: 'Staff'
    };
    return Object.entries(counts)
      .map(([role, count]) => `${count} ${ROLE_LABELS[role as UserRole]}`)
      .join(' · ');
  })();

  return (
    <div className='flex w-full flex-col justify-start gap-6'>
      <div className='flex flex-col gap-4 px-1 md:flex-row md:items-center md:justify-between'>
        {/* Left: always-visible search */}
        <div className='flex w-full flex-1 items-center gap-2 md:max-w-sm'>
          <SearchInput
            isLoading={isPending}
            placeholder='Search name, email or uid...'
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onSearch={() => handleSearchSubmit()}
          />
        </div>

        {/* Right: bulk section (when selected) + separator + filters */}
        <div className='flex items-center gap-2'>
          {selectedCount > 0 && (
            <>
              {/* Selection action toolbar */}
              <div className='flex animate-in items-center gap-2 fade-in slide-in-from-right-2'>
                <div className='flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 shadow-sm'>
                  <span className='text-sm font-medium whitespace-nowrap text-primary tabular-nums'>
                    {selectedCount} {selectedCount === 1 ? 'user' : 'users'} selected
                  </span>
                  {selectedRoleBreakdown && (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className='h-3.5 w-3.5 cursor-default text-primary/60 transition-colors hover:text-primary' />
                        </TooltipTrigger>
                        <TooltipContent className='text-xs' side='bottom'>
                          <p className='mb-1 font-medium'>Role breakdown</p>
                          {selectedRoleBreakdown.split(' · ').map((item, i) => (
                            <p key={i} className='text-muted-foreground'>
                              {item}
                            </p>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                {bulkError && (
                  <span className='max-w-32 truncate text-xs font-medium text-destructive'>{bulkError}</span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className='h-9' disabled={isBulkPending} size='sm' variant='outline'>
                      {isBulkPending ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : (
                        <ShieldCheckIcon className='mr-2 h-4 w-4' />
                      )}
                      Assign Role
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>
                      Assign Role to {selectedCount} {selectedCount === 1 ? 'user' : 'users'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {BULK_ROLE_OPTIONS.map(opt => (
                      <DropdownMenuItem key={opt.value} onClick={() => handleBulkAssignRole(opt.value)}>
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  className='h-9'
                  disabled={isBulkPending}
                  size='sm'
                  variant='destructive'
                  onClick={handleBulkDelete}
                >
                  {isBulkPending ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Trash2Icon className='mr-2 h-4 w-4' />
                  )}
                  Delete
                </Button>
              </div>
            </>
          )}

          <Select value={currentRole || 'ALL'} onValueChange={val => updateQueryParams({ role: val })}>
            <SelectTrigger className='w-full sm:w-40'>
              <SelectValue placeholder='Filter by Role' />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map(role => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='h-10' size='sm' variant='outline'>
                <ColumnsIcon className='mr-2 h-4 w-4' />
                <span className='hidden lg:inline'>Customize Columns</span>
                <span className='lg:hidden'>Columns</span>
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
        </div>
      </div>

      <div className='overflow-hidden rounded-lg border bg-card'>
        <Table>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className='relative **:data-[slot=table-cell]:first:w-8'>
            {isPending && (
              <TableRow
                className='absolute inset-0 z-10 flex h-full w-full items-center justify-center bg-background/50 backdrop-blur-[1px]'
                style={{ borderBottom: 0 }}
              >
                <TableCell className='border-none' colSpan={columns.length}>
                  <Loader2 className='mx-auto h-6 w-6 animate-spin text-muted-foreground' />
                </TableCell>
              </TableRow>
            )}
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  className={isPending ? 'opacity-50' : ''}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className='h-24 text-center text-muted-foreground' colSpan={columns.length}>
                  {isPending ? '' : 'No users found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between px-2 pb-4'>
        <div className='hidden flex-1 text-sm text-muted-foreground lg:flex'>
          {selectedCount} of {totalCount} row
          {selectedCount === 1 ? '' : 's'} selected
        </div>
        <div className='flex w-full items-center gap-8 lg:w-fit'>
          <div className='flex w-fit items-center justify-center text-sm font-medium'>
            Page {currentPage} of {Math.max(1, totalPages)}
          </div>
          <div className='ml-auto flex items-center gap-2 lg:ml-0'>
            <Button
              className='hidden h-8 w-8 p-0 lg:flex'
              disabled={currentPage <= 1 || isPending}
              variant='outline'
              onClick={() => updateQueryParams({ page: '1' })}
            >
              <span className='sr-only'>Go to first page</span>
              <ChevronsLeftIcon className='h-4 w-4' />
            </Button>
            <Button
              className='size-8'
              disabled={currentPage <= 1 || isPending}
              size='icon'
              variant='outline'
              onClick={() => updateQueryParams({ page: String(currentPage - 1) })}
            >
              <span className='sr-only'>Go to previous page</span>
              <ChevronLeftIcon className='h-4 w-4' />
            </Button>
            <Button
              className='size-8'
              disabled={currentPage >= totalPages || isPending}
              size='icon'
              variant='outline'
              onClick={() => updateQueryParams({ page: String(currentPage + 1) })}
            >
              <span className='sr-only'>Go to next page</span>
              <ChevronRightIcon className='h-4 w-4' />
            </Button>
            <Button
              className='hidden size-8 lg:flex'
              disabled={currentPage >= totalPages || isPending}
              size='icon'
              variant='outline'
              onClick={() => updateQueryParams({ page: String(totalPages) })}
            >
              <span className='sr-only'>Go to last page</span>
              <ChevronsRightIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
