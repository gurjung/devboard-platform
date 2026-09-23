"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Plus,
  ChevronRight,
  FolderPlus,
  Layers,
} from "lucide-react";
import { CreateProjectDialog } from "@/features/project/components/create-project-dialog";

export interface DashboardProjectItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  _count?: {
    tasks: number;
  };
}

interface WorkspaceProjectsCardProps {
  workspaceId: string;
  workspaceSlug: string;
  projects: DashboardProjectItem[];
}

export function WorkspaceProjectsCard({
  workspaceId,
  workspaceSlug,
  projects,
}: WorkspaceProjectsCardProps) {
  return (
    <Card className="flex flex-col justify-between rounded-xl border border-border/80 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Projects
              </CardTitle>
              <CardDescription className="text-xs">
                All projects in this workspace
              </CardDescription>
            </div>
          </div>

          <CreateProjectDialog
            workspaceId={workspaceId}
            workspaceSlug={workspaceSlug}
          >
            <Button
              variant="outline"
              size="xs"
              className="gap-1 text-xs font-medium"
            >
              <Plus className="h-3 w-3" />
              <span>New</span>
            </Button>
          </CreateProjectDialog>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
              <FolderPlus className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No projects yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
              Get started by creating your first project to organize tasks and
              collaborate.
            </p>
            <CreateProjectDialog
              workspaceId={workspaceId}
              workspaceSlug={workspaceSlug}
            >
              <Button size="sm" className="mt-4 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Create Project</span>
              </Button>
            </CreateProjectDialog>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {projects.map((project) => {
              const taskCount = project._count?.tasks ?? 0;
              const initials = project.name
                ? project.name.slice(0, 2).toUpperCase()
                : "PR";

              return (
                <Link
                  key={project.id}
                  href={`/dashboard/${workspaceSlug}/projects/${project.slug}`}
                  className="group -mx-2 flex items-center justify-between rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <Avatar className="h-8 w-8 rounded-lg shrink-0 border border-border/50">
                      {project.logo && (
                        <AvatarImage
                          src={project.logo}
                          alt={project.name}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {taskCount} {taskCount === 1 ? "task" : "tasks"}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform duration-200 group-hover:text-primary group-hover:translate-x-0.5 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
