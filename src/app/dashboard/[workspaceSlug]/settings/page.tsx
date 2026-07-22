import { getWorkspaceMembership } from "@/lib/workspace-auth";
import { redirect } from "next/navigation";
import { WorkspaceForm } from "@/features/workspace/components/settings/workspace-form";
import { WorkspaceRole } from "@/features/workspace/constants";
import { en } from "@/locales/en";

interface WorkspaceSettingsPageProps {
  params: Promise<{
    workspaceSlug: string;
  }>;
}

export default async function WorkspaceSettingsPage({
  params,
}: WorkspaceSettingsPageProps) {
  const { workspaceSlug } = await params;
  const membership = await getWorkspaceMembership(workspaceSlug);

  if (!membership) {
    redirect("/dashboard");
  }

  const { workspace, role } = membership;

  // Check if role is authorized (OWNER or ADMIN)
  if (role !== WorkspaceRole.OWNER && role !== WorkspaceRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <h2 className="text-xl font-bold text-foreground">{en.workspace.settingsPage.accessDeniedTitle}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {en.workspace.settingsPage.accessDeniedDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto py-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-center">
          {en.workspace.settingsPage.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {en.workspace.settingsPage.description}
        </p>
      </div>

      <WorkspaceForm
        mode="edit"
        initialValues={{
          id: workspace.id,
          name: workspace.name,
          logo: workspace.logo,
        }}
      />
    </div>
  );
}

