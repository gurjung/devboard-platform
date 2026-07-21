import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreateWorkspaceDialog } from "@/features/workspace/components/create-workspace-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
    <div className="flex flex-col items-start gap-4 p-6 border rounded-xl bg-card max-w-xl mx-auto mt-12 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight">Welcome to DevBoard</h1>
      <p className="text-muted-foreground">
        You are not a member of any workspace yet. Create a new workspace to get started.
      </p>
      <CreateWorkspaceDialog>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Workspace
        </Button>
      </CreateWorkspaceDialog>
    </div>
  );
}
