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
  BarChart4,
  X,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityFilterProps {
  priority: string;
  onChange: (priority: string) => void;
}

const priorityLabels: Record<string, string> = {
  "": "All",
  all: "All",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const priorityItems = [
  {
    value: "all",
    label: "All",
    icon: BarChart4,
    iconClass: "text-muted-foreground",
  },
  {
    value: "LOW",
    label: "Low",
    icon: ArrowDown,
    iconClass: "text-muted-foreground",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    icon: ArrowRight,
    iconClass: "text-blue-500",
  },
  {
    value: "HIGH",
    label: "High",
    icon: ArrowUp,
    iconClass: "text-orange-500",
  },
  {
    value: "URGENT",
    label: "Urgent",
    icon: AlertTriangle,
    iconClass: "text-red-500",
  },
];

export function PriorityFilter({ priority, onChange }: PriorityFilterProps) {
  return (
    <Select
      value={priority || "all"}
      onValueChange={(val) =>
        onChange(val === "all" || val === null ? "" : val)
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
            title="Clear Priority Filter"
          >
            <X className="h-3 w-3 text-muted-foreground group-hover/clear:text-red-500 transition-colors" />
          </span>
        )}
      </SelectTrigger>
      <SelectContent className="p-1 rounded-xl shadow-md border border-border/80 min-w-[160px]">
        <SelectGroup>
          {priorityItems.map((item) => {
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
