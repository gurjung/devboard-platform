"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { useWorkspaces } from "@/features/workspace/hooks/settings/use-workspaces";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface DashboardShellProps {
  user?: User;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: workspaces } = useWorkspaces();

  const hasWorkspaces = Boolean(workspaces && workspaces.length > 0);

  return (
    <div className="flex min-h-screen bg-background">
      {hasWorkspaces && (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar
          user={user}
          onOpenSidebar={() => setSidebarOpen((prev) => !prev)}
          showSidebarTrigger={hasWorkspaces}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
