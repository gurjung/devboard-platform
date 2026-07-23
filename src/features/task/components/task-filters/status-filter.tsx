"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ListTodo,
  X,
  HelpCircle,
  Circle,
  CircleDot,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusFilterProps {
  status: string;
  onChange: (status: string) => void;
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

const statusItems = [
  {
    value: "all",
    label: "All",
    icon: ListTodo,
    iconClass: "text-muted-foreground",
  },
  {
    value: "BACKLOG",
    label: "Backlog",
    icon: HelpCircle,
    iconClass: "text-muted-foreground/80",
  },
  {
    value: "TODO",
    label: "Todo",
    icon: Circle,
    iconClass: "text-muted-foreground/80",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    icon: CircleDot,
    iconClass: "text-amber-500",
  },
  {
    value: "IN_REVIEW",
    label: "In Review",
    icon: Eye,
    iconClass: "text-purple-500",
  },
  {
    value: "DONE",
    label: "Done",
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
  },
];

export function StatusFilter({ status, onChange }: StatusFilterProps) {
  return (
    <Select
      value={status || "all"}
      onValueChange={(val) =>
        onChange(val === "all" || val === null ? "" : val)
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
              onChange("");
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onChange("");
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
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <SelectItem key={item.value} value={item.value}>
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-3.5 w-3.5", item.iconClass)} />
                  <span>{item.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
