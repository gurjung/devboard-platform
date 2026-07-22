"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { en } from "@/locales/en";

export interface DialogActionsProps {
  cancelLabel?: string;
  completeLabel: string;
  onCancel: () => void;
  isCompleteDisabled?: boolean;
  isCompleteLoading?: boolean;
  completeLoadingLabel?: string;
}

export function DialogActions({
  cancelLabel = en.common.cancel,
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
    <DialogFooter className="flex flex-row items-center justify-between gap-3 w-full sm:justify-between pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isCompleteLoading}
        className="h-9 text-xs rounded-xl px-4 cursor-pointer"
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        disabled={isCompleteDisabled || isCompleteLoading}
        className="h-9 text-xs rounded-xl px-4 cursor-pointer"
      >
        {showLoadingState && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {label}
      </Button>
    </DialogFooter>
  );
}
