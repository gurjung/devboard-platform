"use client";

import { useWorkspaceMembers } from "@/features/workspace/hooks/members/use-workspace-members";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  X,
  User,
  ListTodo,
  BarChart4,
  HelpCircle,
  Circle,
  CircleDot,
  Eye,
  CheckCircle2,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  AlertTriangle,
  Users,
  UserX,
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const statusLabels: Record<string, string> = {
  "": "All",
  all: "All",
  BACKLOG: "Backlog",
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const priorityLabels: Record<string, string> = {
  "": "All",
  all: "All",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

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
  const { data: members = [] } = useWorkspaceMembers(workspaceId);

  const selectedDate = dueDate ? new Date(dueDate) : undefined;

  // Resolve assignee label
  const selectedMember = members.find((m) => m.user.id === assigneeId);
  const assigneeLabel =
    assigneeId === "unassigned"
      ? "Unassigned"
      : selectedMember
        ? selectedMember.user.name || selectedMember.user.email || "User"
        : "All";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Status Filter */}
      <Select
        value={status || "all"}
        onValueChange={(val) =>
          onStatusChange(val === "all" || val === null ? "" : val)
        }
      >
        <SelectTrigger className="min-w-[145px] w-fit h-9 px-3 bg-background hover:bg-accent/40 border border-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 hover:border-border cursor-pointer flex items-center gap-1.5 transition-colors">
          <ListTodo className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground font-normal">Status:</span>
          <SelectValue>{statusLabels[status] || "All"}</SelectValue>
          {status && status !== "all" && (
            <span
              role="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onStatusChange("");
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onStatusChange("");
              }}
              className="h-4 w-4 rounded-md hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition-colors ml-1 z-10 group/clear"
              title="Clear Status Filter"
            >
              <X className="h-3 w-3 text-muted-foreground group-hover/clear:text-red-500 transition-colors" />
            </span>
          )}
        </SelectTrigger>
        <SelectContent className="p-1 rounded-xl shadow-md border border-border/80 min-w-[160px]">
          <SelectGroup>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />
                <span>All</span>
              </div>
            </SelectItem>
            <SelectItem value="BACKLOG">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/80" />
                <span>Backlog</span>
              </div>
            </SelectItem>
            <SelectItem value="TODO">
              <div className="flex items-center gap-2">
                <Circle className="h-3.5 w-3.5 text-muted-foreground/80" />
                <span>Todo</span>
              </div>
            </SelectItem>
            <SelectItem value="IN_PROGRESS">
              <div className="flex items-center gap-2">
                <CircleDot className="h-3.5 w-3.5 text-amber-500" />
                <span>In Progress</span>
              </div>
            </SelectItem>
            <SelectItem value="IN_REVIEW">
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-purple-500" />
                <span>In Review</span>
              </div>
            </SelectItem>
            <SelectItem value="DONE">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Done</span>
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        value={priority || "all"}
        onValueChange={(val) =>
          onPriorityChange(val === "all" || val === null ? "" : val)
        }
      >
        <SelectTrigger className="min-w-[145px] w-fit h-9 px-3 bg-background hover:bg-accent/40 border border-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 hover:border-border cursor-pointer flex items-center gap-1.5 transition-colors">
          <BarChart4 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground font-normal">Priority:</span>
          <SelectValue>{priorityLabels[priority] || "All"}</SelectValue>
          {priority && priority !== "all" && (
            <span
              role="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onPriorityChange("");
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onPriorityChange("");
              }}
              className="h-4 w-4 rounded-md hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition-colors ml-1 z-10 group/clear"
              title="Clear Priority Filter"
            >
              <X className="h-3 w-3 text-muted-foreground group-hover/clear:text-red-500 transition-colors" />
            </span>
          )}
        </SelectTrigger>
        <SelectContent className="p-1 rounded-xl shadow-md border border-border/80 min-w-[160px]">
          <SelectGroup>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <BarChart4 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>All</span>
              </div>
            </SelectItem>
            <SelectItem value="LOW">
              <div className="flex items-center gap-2">
                <ArrowDown className="h-3.5 w-3.5 text-zinc-500" />
                <span>Low</span>
              </div>
            </SelectItem>
            <SelectItem value="MEDIUM">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
                <span>Medium</span>
              </div>
            </SelectItem>
            <SelectItem value="HIGH">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-3.5 w-3.5 text-orange-500" />
                <span>High</span>
              </div>
            </SelectItem>
            <SelectItem value="URGENT">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                <span>Urgent</span>
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Assignee Filter */}
      <Select
        value={assigneeId || "all"}
        onValueChange={(val) =>
          onAssigneeChange(val === "all" || val === null ? "" : val)
        }
      >
        <SelectTrigger className="min-w-[170px] max-w-[240px] w-fit h-9 px-3 bg-background hover:bg-accent/40 border border-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 hover:border-border cursor-pointer flex items-center gap-1.5 transition-colors">
          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground font-normal">Assignee:</span>
          <SelectValue>{assigneeLabel}</SelectValue>
          {assigneeId && assigneeId !== "all" && (
            <span
              role="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onAssigneeChange("");
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onAssigneeChange("");
              }}
              className="h-4 w-4 rounded-md hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition-colors ml-1 z-10 group/clear"
              title="Clear Assignee Filter"
            >
              <X className="h-3 w-3 text-muted-foreground group-hover/clear:text-red-500 transition-colors" />
            </span>
          )}
        </SelectTrigger>
        <SelectContent className="p-1 rounded-xl shadow-md border border-border/80 min-w-[210px]">
          <SelectGroup>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span>All</span>
              </div>
            </SelectItem>
            <SelectItem value="unassigned">
              <div className="flex items-center gap-2">
                <UserX className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span>Unassigned</span>
              </div>
            </SelectItem>
            {members.map((member) => (
              <SelectItem key={member.user.id} value={member.user.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={member.user.image || ""} />
                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                      {member.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {member.user.name || member.user.email || "User"}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Due Date Filter */}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="h-9 px-3 bg-background hover:bg-accent/40 border border-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 hover:border-border cursor-pointer gap-2 transition-colors animate-in fade-in duration-200"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground font-normal">
                Due Date:
              </span>
              <span>
                {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Any"}
              </span>
              {dueDate && (
                <span
                  role="button"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDueDateChange("");
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDueDateChange("");
                  }}
                  className="h-4 w-4 rounded-md hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition-colors ml-1 z-10 group/clear"
                  title="Clear Due Date Filter"
                >
                  <X className="h-3 w-3 text-muted-foreground group-hover/clear:text-red-500 transition-colors" />
                </span>
              )}
            </Button>
          }
        >
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground font-normal">Due Date:</span>
          <span>
            {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Any"}
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border border-border/80 rounded-xl"
          align="start"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onDueDateChange(format(date, "yyyy-MM-dd"));
              } else {
                onDueDateChange("");
              }
            }}
          />
        </PopoverContent>
      </Popover>

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
