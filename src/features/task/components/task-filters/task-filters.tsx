"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { StatusFilter } from "./status-filter";
import { PriorityFilter } from "./priority-filter";
import { AssigneeFilter } from "./assignee-filter";
import { DueDateFilter } from "./due-date-filter";

interface TaskFiltersProps {
  workspaceId: string;
  status: string;
  priority: string;
  assigneeId: string;
  dueDate: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onAssigneeChange: (assigneeId: string) => void;
  onDueDateChange: (dueDate: string) => void;
  onClearFilters: () => void;
  isFiltered: boolean;
}

export function TaskFilters({
  workspaceId,
  status,
  priority,
  assigneeId,
  dueDate,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onDueDateChange,
  onClearFilters,
  isFiltered,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Status Filter */}
      <StatusFilter status={status} onChange={onStatusChange} />

      {/* Priority Filter */}
      <PriorityFilter priority={priority} onChange={onPriorityChange} />

      {/* Assignee Filter */}
      <AssigneeFilter
        workspaceId={workspaceId}
        assigneeId={assigneeId}
        onChange={onAssigneeChange}
      />

      {/* Due Date Filter */}
      <DueDateFilter dueDate={dueDate} onChange={onDueDateChange} />

      {/* Clear Filters */}
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={onClearFilters}
          className="h-9 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
