"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface FormDialogProps {
  trigger?: React.ReactNode;
  title: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function FormDialog({
  trigger,
  title,
  open,
  onOpenChange,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogTrigger render={React.isValidElement(trigger) ? trigger : undefined}>
          {React.isValidElement(trigger) ? null : trigger}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader className="text-center items-center justify-center pr-0">
          <DialogTitle className="text-center pr-0 text-base font-bold">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
