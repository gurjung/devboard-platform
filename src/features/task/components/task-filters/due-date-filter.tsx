"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

interface DueDateFilterProps {
  dueDate: string;
  onChange: (dueDate: string) => void;
}

export function DueDateFilter({ dueDate, onChange }: DueDateFilterProps) {
  const selectedDate = dueDate ? new Date(dueDate) : undefined;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="h-9 px-3 bg-background hover:bg-accent/40 border border-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 hover:border-border cursor-pointer gap-2 transition-colors animate-in fade-in duration-200"
          >
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground font-normal">Due Date:</span>
            <span>
              {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Any"}
            </span>
            {dueDate && (
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
              onChange(format(date, "yyyy-MM-dd"));
            } else {
              onChange("");
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
