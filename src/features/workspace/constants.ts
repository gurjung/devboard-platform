import { WorkspaceRole } from "@prisma/client";

export const WORKSPACE_ROLES = {
  OWNER: WorkspaceRole.OWNER,
  ADMIN: WorkspaceRole.ADMIN,
  MEMBER: WorkspaceRole.MEMBER,
} as const;

export { WorkspaceRole };
