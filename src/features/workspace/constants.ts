import { WorkspaceRole } from "@prisma/client";

export const WORKSPACE_ROLES = {
  OWNER: WorkspaceRole.OWNER,
  ADMIN: WorkspaceRole.ADMIN,
  MEMBER: WorkspaceRole.MEMBER,
} as const;

export { WorkspaceRole };

export const INVITE_REASONS = {
  NOT_FOUND: "NOT_FOUND",
  ALREADY_ACCEPTED: "ALREADY_ACCEPTED",
  REVOKED: "REVOKED",
  EXPIRED: "EXPIRED",
} as const;

export type InviteReason = typeof INVITE_REASONS[keyof typeof INVITE_REASONS];

