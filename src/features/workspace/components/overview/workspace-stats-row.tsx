import * as React from "react";
import {
  FolderKanban,
  ListTodo,
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "./stat-card";

interface WorkspaceStatsRowProps {
  workspaceSlug: string;
  stats: {
    totalProjects: number;
    totalTasks: number;
    myAssignedTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
}

export function WorkspaceStatsRow({
  workspaceSlug,
  stats,
}: WorkspaceStatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      <StatCard
        label="Total Projects"
        value={stats.totalProjects}
        icon={FolderKanban}
        variant="default"
      />
      <StatCard
        label="Total Tasks"
        value={stats.totalTasks}
        icon={ListTodo}
        variant="default"
      />
      <StatCard
        label="My Assigned Tasks"
        value={stats.myAssignedTasks}
        icon={UserCheck}
        href={`/dashboard/${workspaceSlug}/my-tasks`}
        variant="info"
      />
      <StatCard
        label="Completed"
        value={stats.completedTasks}
        icon={CheckCircle2}
        href={`/dashboard/${workspaceSlug}/my-tasks?status=DONE`}
        variant="success"
      />
      <div className="col-span-2 sm:col-span-1">
        <StatCard
          label="Overdue"
          value={stats.overdueTasks}
          icon={AlertCircle}
          href={`/dashboard/${workspaceSlug}/my-tasks?status=OVERDUE&overdue=true`}
          variant={stats.overdueTasks > 0 ? "danger" : "default"}
        />
      </div>
    </div>
  );
}
