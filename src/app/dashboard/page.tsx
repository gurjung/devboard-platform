import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { WorkspaceForm } from "@/features/workspace/components/settings/workspace-form";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      workspace: true,
    },
  });

  if (membership) {
    redirect(`/dashboard/${membership.workspace.slug}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-6 px-4">
      <WorkspaceForm mode="create" />
    </div>
  );
}
