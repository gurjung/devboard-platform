"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export interface DialogActionsProps {
  cancelLabel?: string;
  completeLabel: string;
  onCancel: () => void;
  isCompleteDisabled?: boolean;
  isCompleteLoading?: boolean;
  completeLoadingLabel?: string;
}

export function DialogActions({
  cancelLabel = "Cancel",
  completeLabel,
  onCancel,
  isCompleteDisabled = false,
  isCompleteLoading = false,
  completeLoadingLabel,
}: DialogActionsProps) {
  const showLoadingState = isCompleteLoading;
  const label = showLoadingState
    ? completeLoadingLabel ?? completeLabel
    : completeLabel;

  return (
    <DialogFooter className="flex flex-row justify-between sm:justify-between w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isCompleteLoading}
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        disabled={isCompleteDisabled || isCompleteLoading}
      >
        {showLoadingState && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {label}
      </Button>
    </DialogFooter>
  );
}
