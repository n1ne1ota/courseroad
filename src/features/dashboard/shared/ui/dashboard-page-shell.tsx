import type { JSX, ReactNode } from 'react';

/** Page body container. The dashboard layout supplies the gutters and the vertical inset. */
export const dashboardPageClass = 'flex min-w-0 flex-col gap-section';

type DashboardPageShellProps = {
  /** Static controls beside the heading (e.g. a "Create" button). Must not depend on loaded data. */
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  title: string;
};

/**
 * Static page frame: title, description, and actions render immediately,
 * while `children` (the data-dependent body) suspends on its own skeleton.
 */
export function DashboardPageShell({ actions, children, description, title }: DashboardPageShellProps): JSX.Element {
  return (
    <div className='flex flex-col gap-section'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
          {description ? <p className='mt-1 text-muted-foreground'>{description}</p> : null}
        </div>
        {actions}
      </div>
      <div>{children}</div>
    </div>
  );
}

/** Bordered panel holding a list or grid; shared by loaded views and their skeletons. */
export function DashboardContentPanel({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className='rounded-md border'>
      <div className='p-card'>{children}</div>
    </div>
  );
}
