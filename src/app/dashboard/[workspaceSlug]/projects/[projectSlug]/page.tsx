import { getWorkspaceMembership } from "@/lib/workspace-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

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

  redirect(`/dashboard/${workspaceSlug}/projects/${projectSlug}/tasks`);
}
