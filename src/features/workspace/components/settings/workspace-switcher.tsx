"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";
import { Building2 } from "lucide-react";
import { en } from "@/locales/en";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspaces } from "../../hooks/settings/use-workspaces";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

export function WorkspaceSwitcher() {
  const router = useRouter();
  const params = useParams();
  const activeSlug = params?.workspaceSlug as string | undefined;

  const { data: workspaces, isLoading } = useWorkspaces();

  const currentWorkspace = React.useMemo(() => {
    if (!workspaces || workspaces.length === 0) return null;
    return workspaces.find((w: any) => w.slug === activeSlug) || workspaces[0];
  }, [workspaces, activeSlug]);

  const handleValueChange = (slug: string) => {
    if (slug && slug !== activeSlug) {
      router.push(`/dashboard/${slug}`);
    }
  };

  return (
    <div className="flex flex-col gap-y-2 w-full">
      <div className="flex items-center justify-between px-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {en.workspace.switcher.sectionTitle}
        </p>
        <CreateWorkspaceDialog>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground hover:opacity-75 transition cursor-pointer outline-none"
            title={en.workspace.switcher.createTooltip}
            aria-label={en.workspace.switcher.createTooltip}
          >
            <RiAddCircleFill className="size-5" />
          </button>
        </CreateWorkspaceDialog>
      </div>

      <Select
        value={currentWorkspace?.slug || ""}
        onValueChange={handleValueChange}
        disabled={isLoading || !workspaces || workspaces.length === 0}
      >
        <SelectTrigger className="h-11 w-full px-2.5 py-2 bg-background hover:bg-accent/60 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border border-border/80 shadow-2xs transition-all duration-200 rounded-xl focus:ring-2 focus:ring-primary/20 hover:border-border">
          <SelectValue
            placeholder={
              isLoading
                ? en.workspace.switcher.loadingPlaceholder
                : en.workspace.switcher.selectPlaceholder
            }
          >
            {currentWorkspace ? (
              <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
                <Avatar className="h-6 w-6 rounded-md ring-1 ring-border/50 shrink-0">
                  {currentWorkspace.logo ? (
                    <AvatarImage
                      src={currentWorkspace.logo}
                      alt={currentWorkspace.name}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="text-[10px] font-bold rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
                    {currentWorkspace.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                  <span className="truncate text-xs font-semibold text-foreground tracking-tight">
                    {currentWorkspace.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground/80 capitalize font-medium">
                    {currentWorkspace.role?.toLowerCase() ||
                      en.workspace.switcher.defaultRole}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{en.workspace.switcher.noWorkspaces}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align="start"
          side="bottom"
          alignItemWithTrigger={false}
          className="w-(--anchor-width) min-w-56 p-1 rounded-xl shadow-xl border-border/80"
        >
          <SelectGroup>
            {workspaces?.map((workspace: any) => (
              <SelectItem
                key={workspace.id}
                value={workspace.slug}
                className="py-2 px-2.5 rounded-lg cursor-pointer transition-colors focus:bg-accent"
              >
                <div className="flex items-center gap-2.5 w-full min-w-0">
                  <Avatar className="h-6 w-6 rounded-md ring-1 ring-border/40 shrink-0">
                    {workspace.logo ? (
                      <AvatarImage
                        src={workspace.logo}
                        alt={workspace.name}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="text-[10px] font-bold rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
                      {workspace.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1 leading-tight">
                    <span className="truncate text-xs font-medium text-foreground">
                      {workspace.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/80 capitalize font-normal">
                      {workspace.role?.toLowerCase() ||
                        en.workspace.switcher.defaultRole}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
