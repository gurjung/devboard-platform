import { getWorkspaceMembership } from "@/lib/workspace-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { WorkspaceRole } from "@/features/workspace/constants";

interface ProjectPageProps {
  params: Promise<{
    workspaceSlug: string;
    projectSlug: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { workspaceSlug, projectSlug } = await params;
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

  const canEdit =
    membership.role === WorkspaceRole.OWNER ||
    membership.role === WorkspaceRole.ADMIN;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
            Project
          </span>
        </div>
        {canEdit && (
          <Link
            href={`/dashboard/${workspaceSlug}/projects/${projectSlug}/settings`}
            className="p-2 rounded-lg border border-border/80 hover:bg-accent hover:text-accent-foreground transition"
            title="Project Settings"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Task List Placeholder (future feature) */}
      <div className="flex flex-col items-center justify-center border border-dashed border-border/80 rounded-2xl p-12 text-center bg-muted/10">
        <p className="text-sm font-medium text-muted-foreground">
          Tasks section coming soon
        </p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          This workspace project is ready for task collaboration.
        </p>
      </div>
    </div>
  );
}
