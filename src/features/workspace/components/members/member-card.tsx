"use client";

import React from "react";
import { Trash2, Shield, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WORKSPACE_ROLES, type WorkspaceRole } from "@/features/workspace/constants";
import type { WorkspaceMemberData } from "../../hooks/members/use-workspace-members";
import { en } from "@/locales/en";

interface MemberCardProps {
  member: WorkspaceMemberData;
  currentUserId: string;
  currentUserRole: WorkspaceRole;
  onRoleChange: (member: WorkspaceMemberData, value: string) => void;
  onRemove: (member: WorkspaceMemberData) => void;
  disabled?: boolean;
}

export function MemberCard({
  member,
  currentUserId,
  currentUserRole,
  onRoleChange,
  onRemove,
  disabled = false,
}: MemberCardProps) {
  const isCurrentUser = member.userId === currentUserId;
  const isOwner = member.role === WORKSPACE_ROLES.OWNER;
  const isAdmin = member.role === WORKSPACE_ROLES.ADMIN;

  // Determine if requester can change this member's role
  let canChangeRole = false;
  let selectOptions: WorkspaceRole[] = [];

  if (!isCurrentUser) {
    if (currentUserRole === WORKSPACE_ROLES.OWNER) {
      canChangeRole = true;
      selectOptions = [WORKSPACE_ROLES.MEMBER, WORKSPACE_ROLES.ADMIN, WORKSPACE_ROLES.OWNER];
    } else if (currentUserRole === WORKSPACE_ROLES.ADMIN && !isOwner) {
      canChangeRole = true;
      selectOptions = [WORKSPACE_ROLES.MEMBER, WORKSPACE_ROLES.ADMIN];
    }
  }

  // Determine if requester can remove this member
  const canRemove = currentUserRole === WORKSPACE_ROLES.OWNER && !isCurrentUser;

  return (
    <Card className="rounded-2xl border border-border/80 shadow-sm bg-card hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5 flex flex-col gap-4 justify-between h-full">
        {/* Header row: User Details + Action */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-10 shrink-0">
              <AvatarImage
                src={member.user.image || undefined}
                alt={member.user.name || ""}
              />
              <AvatarFallback className="bg-muted text-foreground font-semibold text-xs">
                {member.user.name
                  ? member.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                   : en.workspace.members.avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate flex items-center gap-1.5">
                {member.user.name || en.workspace.members.anonymousUser}
                {isCurrentUser && (
                  <span className="bg-neutral-200 dark:bg-zinc-800 text-neutral-800 dark:text-zinc-200 px-1.5 py-0.5 rounded-md text-[9px] font-bold">
                    {en.workspace.members.youBadge}
                  </span>
                )}
              </span>
              <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                {member.user.email}
              </span>
            </div>
          </div>

          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onRemove(member)}
              disabled={disabled}
              className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg"
              title={en.workspace.members.removeTooltip}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>

        {/* Bottom row: Role Selector or Static Badge */}
        <div className="flex items-center justify-between border-t border-border/50 pt-3 gap-4">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {en.workspace.members.roleLabel}
          </span>

          {canChangeRole ? (
            <Select
              value={member.role}
              onValueChange={(val) => {
                if (val) onRoleChange(member, val);
              }}
              disabled={disabled}
            >
              <SelectTrigger className="w-28 h-8 px-2 bg-input/20 border-border/80 rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary/20 hover:border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-36 p-1 rounded-lg shadow-md border border-border/80">
                {selectOptions.map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-xs">
                    {opt === WORKSPACE_ROLES.OWNER
                      ? en.workspace.members.roles.ownerTransfer
                      : opt === WORKSPACE_ROLES.ADMIN
                      ? en.workspace.members.roles.admin
                      : en.workspace.members.roles.member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              {isOwner ? (
                <>
                  <Shield className="size-3.5 text-amber-500 fill-amber-500/20" />
                  {en.workspace.members.roles.owner}
                </>
              ) : isAdmin ? (
                <>
                  <Shield className="size-3.5 text-blue-500 fill-blue-500/20" />
                  {en.workspace.members.roles.admin}
                </>
              ) : (
                <>
                  <User className="size-3.5 text-neutral-400" />
                  {en.workspace.members.roles.member}
                </>
              )}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
