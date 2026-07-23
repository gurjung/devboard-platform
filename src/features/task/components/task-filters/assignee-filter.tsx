"use client";

import { useWorkspaceMembers } from "@/features/workspace/hooks/members/use-workspace-members";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, X, Users, UserX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AssigneeFilterProps {
  workspaceId: string;
  assigneeId: string;
  onChange: (assigneeId: string) => void;
}

export function AssigneeFilter({
  workspaceId,
  assigneeId,
  onChange,
}: AssigneeFilterProps) {
  const { data: members = [] } = useWorkspaceMembers(workspaceId);

  // Resolve assignee label
  const selectedMember = members.find((m) => m.user.id === assigneeId);
  const assigneeLabel =
    assigneeId === "unassigned"
      ? "Unassigned"
      : selectedMember
        ? selectedMember.user.name || selectedMember.user.email || "User"
        : "All";

  return (
    <Select
      value={assigneeId || "all"}
      onValueChange={(val) =>
        onChange(val === "all" || val === null ? "" : val)
      }
    >
      <SelectTrigger className="min-w-[170px] max-w-[240px] w-fit h-9 px-3 bg-background hover:bg-accent/40 border border-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 hover:border-border cursor-pointer flex items-center gap-1.5 transition-colors">
        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground font-normal">Assignee:</span>
        <SelectValue>{assigneeLabel}</SelectValue>
        {assigneeId && assigneeId !== "all" && (
          <span
            role="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onChange("");
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onChange("");
            }}
            className="h-4 w-4 rounded-md hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition-colors ml-1 z-10 group/clear"
            title="Clear Assignee Filter"
          >
            <X className="h-3 w-3 text-muted-foreground group-hover/clear:text-red-500 transition-colors" />
          </span>
        )}
      </SelectTrigger>
      <SelectContent className="p-1 rounded-xl shadow-md border border-border/80 min-w-[210px]">
        <SelectGroup>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span>All</span>
            </div>
          </SelectItem>
          <SelectItem value="unassigned">
            <div className="flex items-center gap-2">
              <UserX className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>Unassigned</span>
            </div>
          </SelectItem>
          {members.map((member) => (
            <SelectItem key={member.user.id} value={member.user.id}>
              <div className="flex items-center gap-2">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={member.user.image || ""} />
                  <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                    {member.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">
                  {member.user.name || member.user.email || "User"}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
