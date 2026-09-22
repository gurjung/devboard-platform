import { getWorkspaceMembership } from "@/lib/workspace-auth";
import { redirect } from "next/navigation";
import { MyTasksClient } from "@/features/task/components/my-tasks-client";

interface MyTasksPageProps {
  params: Promise<{
    workspaceSlug: string;
  }>;
  searchParams: Promise<{
    status?: string;
    priority?: string;
    dueDate?: string;
  }>;
}

export default async function MyTasksPage({
  params,
  searchParams,
}: MyTasksPageProps) {
  const { workspaceSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const membership = await getWorkspaceMembership(workspaceSlug);

  if (!membership) {
    redirect("/dashboard");
  }

  return (
    <MyTasksClient
      workspaceId={membership.workspaceId}
      workspaceSlug={workspaceSlug}
      workspaceName={membership.workspace.name}
      membership={membership}
      searchParams={resolvedSearchParams}
    />
  );
}
