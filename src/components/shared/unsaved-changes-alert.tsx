'use client';

import { ConfirmationDialog } from '@courseroad/kurume-ui';

import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';

interface UnsavedChangesAlertProps {
  isDirty: boolean;
}

/** Prompt before leaving an app form with unsaved changes. */
export function UnsavedChangesAlert({ isDirty }: UnsavedChangesAlertProps) {
  const { cancelNavigation, confirmNavigation, setShowPrompt, showPrompt } = useUnsavedChanges(isDirty);

  return (
    <ConfirmationDialog
      confirmText='Leave'
      description='You have unsaved changes. Are you sure you want to leave this page?'
      open={showPrompt}
      title='Unsaved Changes'
      variant='destructive'
      onConfirm={confirmNavigation}
      onOpenChange={open => {
        if (!open) cancelNavigation();
        setShowPrompt(open);
      }}
    />
  );
}
