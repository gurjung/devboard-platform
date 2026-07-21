import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceRole } from "@prisma/client";

export interface WorkspaceMembershipResult {
  membership: {
    id: string;
    workspaceId: string;
    userId: string;
    role: WorkspaceRole;
    createdAt: Date;
    workspace: {
      id: string;
      name: string;
      slug: string;
      logo: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}

/**
  * Retrieves the workspace membership details for the currently authenticated user
  * by workspace slug. Returns null if unauthorized or not a member.
  */
export async function getWorkspaceMembership(workspaceSlug: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: session.user.id,
      workspace: {
        slug: workspaceSlug,
      },
    },
    include: {
      workspace: true,
    },
  });

  return membership;
}

/**
  * Checks if the currently authenticated user has one of the allowed roles
  * within the specified workspace.
  */
export async function hasWorkspaceRole(
  workspaceSlug: string,
  allowedRoles: WorkspaceRole[]
): Promise<boolean> {
  const membership = await getWorkspaceMembership(workspaceSlug);
  if (!membership) return false;
  return allowedRoles.includes(membership.role);
}
