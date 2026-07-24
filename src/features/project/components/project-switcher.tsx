"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";
import { FolderKanban } from "lucide-react";
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
import { useWorkspaces } from "@/features/workspace/hooks/settings/use-workspaces";
import { useProjects } from "../hooks/use-projects";
import { CreateProjectDialog } from "./create-project-dialog";

export function ProjectSwitcher() {
  const router = useRouter();
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string | undefined;
  const activeProjectSlug = params?.projectSlug as string | undefined;

  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();

  const currentWorkspace = React.useMemo(() => {
    if (!workspaces || !workspaceSlug) return null;
    return workspaces.find((w: any) => w.slug === workspaceSlug) || null;
  }, [workspaces, workspaceSlug]);

  const workspaceId = currentWorkspace?.id;

  const { data: projects, isLoading: isProjectsLoading } = useProjects(
    workspaceId || ""
  );

  const currentProject = React.useMemo(() => {
    if (!projects || projects.length === 0) return null;
    return projects.find((p: any) => p.slug === activeProjectSlug) || null;
  }, [projects, activeProjectSlug]);

  const handleValueChange = (slug: string) => {
    if (slug && slug !== activeProjectSlug && workspaceSlug) {
      router.push(`/dashboard/${workspaceSlug}/projects/${slug}/tasks`);
    }
  };

  const isLoading = isWorkspacesLoading || isProjectsLoading;

  if (!workspaceSlug) return null;

  return (
    <div className="flex flex-col gap-y-2 w-full">
      <div className="flex items-center justify-between px-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {en.project.switcher.sectionTitle}
        </p>
        {workspaceId && workspaceSlug && (
          <CreateProjectDialog
            workspaceId={workspaceId}
            workspaceSlug={workspaceSlug}
          >
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground hover:opacity-75 transition cursor-pointer outline-none"
              title={en.project.switcher.createTooltip}
              aria-label={en.project.switcher.createTooltip}
            >
              <RiAddCircleFill className="size-5" />
            </button>
          </CreateProjectDialog>
        )}
      </div>

      <Select
        value={currentProject?.slug || ""}
        onValueChange={handleValueChange}
        disabled={isLoading || !projects || projects.length === 0}
      >
        <SelectTrigger className="h-11 w-full px-2.5 py-2 bg-background hover:bg-accent/60 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border border-border/80 shadow-2xs transition-all duration-200 rounded-xl focus:ring-2 focus:ring-primary/20 hover:border-border">
          <SelectValue
            placeholder={
              isLoading
                ? en.project.switcher.loadingPlaceholder
                : en.project.switcher.selectPlaceholder
            }
          >
            {currentProject ? (
              <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
                <Avatar className="h-6 w-6 rounded-md ring-1 ring-border/50 shrink-0">
                  {currentProject.logo ? (
                    <AvatarImage
                      src={currentProject.logo}
                      alt={currentProject.name}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="text-[10px] font-bold rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
                    {currentProject.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1 leading-tight justify-center">
                  <span className="truncate text-xs font-semibold text-foreground tracking-tight">
                    {currentProject.name}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FolderKanban className="h-4 w-4" />
                <span>{en.project.switcher.noProjects}</span>
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
            {projects?.map((project: any) => (
              <SelectItem
                key={project.id}
                value={project.slug}
                className="py-2 px-2.5 rounded-lg cursor-pointer transition-colors focus:bg-accent"
              >
                <div className="flex items-center gap-2.5 w-full min-w-0">
                  <Avatar className="h-6 w-6 rounded-md ring-1 ring-border/40 shrink-0">
                    {project.logo ? (
                      <AvatarImage
                        src={project.logo}
                        alt={project.name}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="text-[10px] font-bold rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
                      {project.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1 leading-tight justify-center">
                    <span className="truncate text-xs font-medium text-foreground">
                      {project.name}
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
