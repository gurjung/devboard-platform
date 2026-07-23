"use client";

import React, { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { en } from "@/locales/en";

interface ProjectDangerZoneProps {
  onDelete: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ProjectDangerZone({
  onDelete,
  isLoading = false,
  disabled = false,
}: ProjectDangerZoneProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  return (
    <>
      <Card className="w-full rounded-2xl border border-red-500/20 dark:border-red-900/30 bg-red-500/[0.04] dark:bg-red-950/20 shadow-md">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider text-center">
            {en.project.dangerZone.title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1 text-center">
            {en.project.dangerZone.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex justify-center">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDeleteOpen(true)}
            disabled={isLoading || disabled}
            className="w-full max-w-xs cursor-pointer h-9 rounded-xl text-xs font-medium bg-red-600 hover:bg-red-700 active:bg-red-800 text-white dark:bg-red-600 dark:hover:bg-red-700 shadow-xs transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {en.project.dangerZone.deletingButton}
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {en.project.dangerZone.deleteButton}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={en.project.dangerZone.confirmTitle}
        description={en.project.dangerZone.confirmDescription}
        confirmLabel={en.project.dangerZone.confirmButton}
        onConfirm={onDelete}
        isLoading={isLoading}
        variant="danger"
      />
    </>
  );
}
