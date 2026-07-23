import { getWorkspaceMembership } from "@/lib/workspace-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ProjectForm } from "@/features/project/components/project-form";
import { WorkspaceRole } from "@/features/workspace/constants";
import { en } from "@/locales/en";

interface ProjectSettingsPageProps {
  params: Promise<{
    workspaceSlug: string;
    projectSlug: string;
  }>;
}

export default async function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  const { workspaceSlug, projectSlug } = await params;
  const membership = await getWorkspaceMembership(workspaceSlug);

  if (!membership) {
    redirect("/dashboard");
  }

  const { workspace, role } = membership;

  // Check if role is authorized (OWNER or ADMIN)
  if (role !== WorkspaceRole.OWNER && role !== WorkspaceRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <h2 className="text-xl font-bold text-foreground">
          {en.project.settingsPage.accessDeniedTitle}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {en.project.settingsPage.accessDeniedDescription}
        </p>
      </div>
    );
  }

  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      workspaceId: workspace.id,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto py-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-center">
          {en.project.settingsPage.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {en.project.settingsPage.description}
        </p>
      </div>

      <ProjectForm
        workspaceId={workspace.id}
        workspaceSlug={workspaceSlug}
        initialValues={{
          id: project.id,
          name: project.name,
          logo: project.logo,
        }}
      />
    </div>
  );
}
