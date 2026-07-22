import { getWorkspaceMembership } from "@/lib/workspace-auth";
import { redirect } from "next/navigation";
import { MembersList } from "@/features/workspace/components/members-list";

interface WorkspaceMembersPageProps {
  params: Promise<{
    workspaceSlug: string;
  }>;
}

export default async function WorkspaceMembersPage({
  params,
}: WorkspaceMembersPageProps) {
  const { workspaceSlug } = await params;
  const membership = await getWorkspaceMembership(workspaceSlug);

  if (!membership) {
    redirect("/dashboard");
  }

  const { workspace, role, userId } = membership;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-center">
          Workspace Members
        </h1>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          Manage roles, update collaboration permissions, or remove team members.
        </p>
      </div>

      <MembersList
        workspaceId={workspace.id}
        currentUserId={userId}
        currentUserRole={role}
      />
    </div>
  );
}
