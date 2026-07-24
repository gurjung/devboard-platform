"use client";

import { Table, Kanban, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewSelectorProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  const views = [
    {
      id: "table",
      label: "Table",
      icon: Table,
      disabled: false,
    },
    {
      id: "kanban",
      label: "Kanban",
      icon: Kanban,
      disabled: true,
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      disabled: true,
    },
  ];

  return (
    <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/50 shrink-0">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;

        return (
          <button
            key={view.id}
            onClick={() => !view.disabled && onViewChange(view.id)}
            disabled={view.disabled}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
              isActive
                ? "bg-background text-foreground shadow-xs border border-border/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
              view.disabled &&
                "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
            )}
            title={view.disabled ? `${view.label} view coming soon` : undefined}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{view.label}</span>
            {view.disabled && (
              <span className="text-[9px] font-normal px-1 py-0.2 rounded bg-muted/65 text-muted-foreground/90 scale-90 border border-border/30">
                Soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
