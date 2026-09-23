import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Users, ArrowRight, UserPlus } from "lucide-react";
import { WorkspaceRole } from "@prisma/client";
import { cn } from "@/lib/utils";

export interface DashboardMemberItem {
  id: string;
  role: WorkspaceRole;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface WorkspaceTeamCardProps {
  workspaceSlug: string;
  memberCount: number;
  members: DashboardMemberItem[];
}

const roleBadgeStyles: Record<
  WorkspaceRole,
  { label: string; className: string }
> = {
  OWNER: {
    label: "Owner",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  ADMIN: {
    label: "Admin",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  MEMBER: {
    label: "Member",
    className: "bg-muted/80 text-muted-foreground border-border/60",
  },
};

function getInitials(name: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function WorkspaceTeamCard({
  workspaceSlug,
  memberCount,
  members,
}: WorkspaceTeamCardProps) {
  const visibleMembers = members.slice(0, 5);
  const remainingCount = memberCount - visibleMembers.length;

  return (
    <Card className="flex flex-col justify-between rounded-xl border border-border/80 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Team</CardTitle>
              <CardDescription className="text-xs">
                Members collaborating here
              </CardDescription>
            </div>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pb-2">
        {/* Avatar Stack Section */}
        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 border border-border/50">
          <span className="text-xs font-medium text-muted-foreground">
            Active collaborators
          </span>
          <div className="flex items-center -space-x-2 overflow-hidden py-0.5">
            {visibleMembers.map((member) => (
              <Avatar
                key={member.id}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-background border-0 shrink-0"
              >
                {member.user.image && (
                  <AvatarImage src={member.user.image} alt={member.user.name} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
                  {getInitials(member.user.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {remainingCount > 0 && (
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-background bg-muted text-[11px] font-semibold text-muted-foreground shrink-0">
                +{remainingCount}
              </div>
            )}
          </div>
        </div>

        {/* Members Preview List */}
        <div className="divide-y divide-border/60">
          {visibleMembers.map((member) => {
            const roleInfo = roleBadgeStyles[member.role] || {
              label: member.role,
              className: "",
            };

            return (
              <div
                key={member.id}
                className="-mx-2 flex items-center justify-between rounded-lg px-2 py-2 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <Avatar className="h-6 w-6 rounded-full shrink-0">
                    {member.user.image && (
                      <AvatarImage
                        src={member.user.image}
                        alt={member.user.name}
                      />
                    )}
                    <AvatarFallback className="text-[10px] bg-muted font-medium">
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-foreground truncate">
                      {member.user.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {member.user.email}
                    </span>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0 rounded-md shrink-0",
                    roleInfo.className
                  )}
                >
                  {roleInfo.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/60">
        <Link
          href={`/dashboard/${workspaceSlug}/members`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-full justify-between text-xs text-muted-foreground hover:text-foreground"
          )}
        >
          <span>Manage team & permissions</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
