import { getWorkspaceMembership } from "@/lib/workspace-auth";
import { notFound, redirect } from "next/navigation";
import { en } from "@/locales/en";

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

  const { workspace, role } = membership;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {en.workspace.overviewPage.title}
        </h1>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
          {role}
        </span>
      </div>
      <p className="text-muted-foreground">
        {en.workspace.overviewPage.welcomePrefix} {workspace.name}{" "}
        {en.workspace.overviewPage.welcomeSuffix}
      </p>
    </div>
  );
}
