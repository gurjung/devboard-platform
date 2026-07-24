import { getWorkspaceMembership } from "@/lib/workspace-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { TasksDashboardClient } from "@/features/task/components/tasks-dashboard-client";

interface TasksPageProps {
  params: Promise<{
    workspaceSlug: string;
    projectSlug: string;
  }>;
  searchParams: Promise<{
    view?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
  }>;
}

export default async function TasksPage({
  params,
  searchParams,
}: TasksPageProps) {
  const { workspaceSlug, projectSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const membership = await getWorkspaceMembership(workspaceSlug);

  if (!membership) {
    redirect("/dashboard");
  }

  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      workspace: {
        slug: workspaceSlug,
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <TasksDashboardClient
      project={project}
      workspaceId={membership.workspaceId}
      workspaceSlug={workspaceSlug}
      projectSlug={projectSlug}
      membership={membership}
      searchParams={resolvedSearchParams}
    />
  );
}
