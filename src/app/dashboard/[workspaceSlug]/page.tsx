import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface WorkspaceDashboardPageProps {
  params: Promise<{
    workspaceSlug: string;
  }>;
}

export default async function WorkspaceDashboardPage({
  params,
}: WorkspaceDashboardPageProps) {
  const { workspaceSlug } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: {
      slug: workspaceSlug,
    },
  });

  if (!workspace) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      <p className="text-muted-foreground">
        Welcome to {workspace.name} dashboard overview.
      </p>
    </div>
  );
}
