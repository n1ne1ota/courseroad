import type { ReactElement, ReactNode } from 'react';

import type { RenderOptions } from '@testing-library/react';

import { render } from '@testing-library/react';

/// Wrapper that provides common providers for component tests.
/// Extend this as the app adds more global providers (theme, query client, etc.).
function AllProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/// Renders a component wrapped in all global providers.
/// Use this instead of bare `render()` when testing components
/// that depend on context providers.
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}
