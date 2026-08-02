"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export const MONTHS = [
  { value: "0", label: "January" },
  { value: "1", label: "February" },
  { value: "2", label: "March" },
  { value: "3", label: "April" },
  { value: "4", label: "May" },
  { value: "5", label: "June" },
  { value: "6", label: "July" },
  { value: "7", label: "August" },
  { value: "8", label: "September" },
  { value: "9", label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
];

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(i.toString());
  }
  return years;
};

const yearOptions = getYearOptions();

interface TaskCalendarPickerProps {
  currentMonth: Date;
  onMonthChange: (month: string | null) => void;
  onYearChange: (year: string | null) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function TaskCalendarPicker({
  currentMonth,
  onMonthChange,
  onYearChange,
  onPrevMonth,
  onNextMonth,
  onToday,
}: TaskCalendarPickerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary/80" />
          <span className="hidden sm:inline">Calendar</span>
        </h2>

        {/* Month Selector */}
        <Select
          value={currentMonth.getMonth().toString()}
          onValueChange={onMonthChange}
        >
          <SelectTrigger className="w-[125px] h-8 text-xs px-2.5 bg-background border-border/80 rounded-lg cursor-pointer flex items-center justify-between gap-1.5">
            <span>{MONTHS[currentMonth.getMonth()].label}</span>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/80">
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value} className="text-xs">
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Selector */}
        <Select
          value={currentMonth.getFullYear().toString()}
          onValueChange={onYearChange}
        >
          <SelectTrigger className="w-[85px] h-8 text-xs px-2.5 bg-background border-border/80 rounded-lg cursor-pointer flex items-center justify-between gap-1.5">
            <span>{currentMonth.getFullYear()}</span>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/80">
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year} className="text-xs">
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg cursor-pointer hover:bg-muted/50 border-border/80"
          onClick={onPrevMonth}
          title="Previous Month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs font-semibold rounded-lg cursor-pointer hover:bg-muted/50 border-border/80"
          onClick={onToday}
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg cursor-pointer hover:bg-muted/50 border-border/80"
          onClick={onNextMonth}
          title="Next Month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
