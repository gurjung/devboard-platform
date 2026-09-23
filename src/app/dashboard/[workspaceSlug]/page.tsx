import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWorkspaceMembership } from "@/lib/workspace-auth";
import { WorkspaceStatsRow } from "@/features/workspace/components/overview/workspace-stats-row";
import { RecentTasksCard } from "@/features/workspace/components/overview/recent-tasks-card";
import { WorkspaceProjectsCard } from "@/features/workspace/components/overview/workspace-projects-card";
import { WorkspaceTeamCard } from "@/features/workspace/components/overview/workspace-team-card";

interface WorkspaceDashboardPageProps {
  params: Promise<{
    workspaceSlug: string;
  }>;
}

export default async function WorkspaceDashboardPage({
  params,
}: WorkspaceDashboardPageProps) {
  const { workspaceSlug } = await params;
  const membership = await getWorkspaceMembership(workspaceSlug);

  if (!membership) {
    redirect("/dashboard");
  }

  const { workspace, role, userId } = membership;
  const workspaceId = workspace.id;
  const now = new Date();

  // Execute all workspace metric and activity queries concurrently
  const [
    totalProjects,
    totalTasks,
    myAssignedTasks,
    completedTasks,
    overdueTasks,
    recentTasks,
    projects,
    memberCount,
    recentMembers,
  ] = await Promise.all([
    // 1. Total Projects
    prisma.project.count({
      where: { workspaceId },
    }),

    // 2. Total Tasks scoped to workspace through Project
    prisma.task.count({
      where: {
        project: { workspaceId },
      },
    }),

    // 3. My Assigned Tasks in this workspace
    prisma.task.count({
      where: {
        assigneeId: userId,
        project: { workspaceId },
      },
    }),

    // 4. Completed Assigned Tasks
    prisma.task.count({
      where: {
        assigneeId: userId,
        project: { workspaceId },
        status: "DONE",
      },
    }),

    // 5. Overdue Assigned Tasks
    prisma.task.count({
      where: {
        assigneeId: userId,
        project: { workspaceId },
        dueDate: { lt: now },
        status: { not: "DONE" },
      },
    }),

    // 6. Up to 5 assigned tasks (overdue / soonest due date first, nulls last)
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        project: { workspaceId },
      },
      take: 5,
      orderBy: [
        { dueDate: { sort: "asc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),

    // 7. All Projects in workspace with task count
    prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    }),

    // 8. Total workspace member count
    prisma.workspaceMember.count({
      where: { workspaceId },
    }),

    // 9. Up to 5 members with user profile details
    prisma.workspaceMember.findMany({
      where: { workspaceId },
      take: 5,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {workspace.name}
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              {role}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Workspace overview, recent tasks, active projects, and team members.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <section aria-label="Workspace Statistics">
        <WorkspaceStatsRow
          workspaceSlug={workspaceSlug}
          stats={{
            totalProjects,
            totalTasks,
            myAssignedTasks,
            completedTasks,
            overdueTasks,
          }}
        />
      </section>

      {/* 3 Activity Cards (Stacks on mobile, 3-columns on lg screens) */}
      <section
        aria-label="Workspace Activity Cards"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <RecentTasksCard workspaceSlug={workspaceSlug} tasks={recentTasks} />
        <WorkspaceProjectsCard
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          projects={projects}
        />
        <WorkspaceTeamCard
          workspaceSlug={workspaceSlug}
          memberCount={memberCount}
          members={recentMembers}
        />
      </section>
    </div>
  );
}
