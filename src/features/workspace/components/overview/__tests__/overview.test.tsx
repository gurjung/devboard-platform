import React from "react";
import { render, screen } from "@testing-library/react";
import { StatCard } from "../stat-card";
import { WorkspaceStatsRow } from "../workspace-stats-row";
import { RecentTasksCard } from "../recent-tasks-card";
import { WorkspaceProjectsCard } from "../workspace-projects-card";
import { WorkspaceTeamCard } from "../workspace-team-card";
import { FolderKanban } from "lucide-react";
import { TaskStatus, TaskPriority, WorkspaceRole } from "@prisma/client";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/dashboard/test-ws",
  useParams: () => ({ workspaceSlug: "test-ws" }),
}));

// Mock CreateProjectDialog
jest.mock("@/features/project/components/create-project-dialog", () => ({
  CreateProjectDialog: ({ children }: any) => (
    <div data-testid="create-project-dialog">{children}</div>
  ),
}));

describe("Workspace Overview Components", () => {
  describe("StatCard", () => {
    it("renders label and value in non-clickable mode", () => {
      render(
        <StatCard label="Total Projects" value={12} icon={FolderKanban} />
      );

      expect(screen.getByText("Total Projects")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("renders clickable link when href is provided", () => {
      render(
        <StatCard
          label="My Assigned Tasks"
          value={5}
          icon={FolderKanban}
          href="/dashboard/test-ws/my-tasks"
        />
      );

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/dashboard/test-ws/my-tasks");
      expect(screen.getByText("My Assigned Tasks")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  describe("WorkspaceStatsRow", () => {
    it("renders all 5 stat cards with correct links", () => {
      render(
        <WorkspaceStatsRow
          workspaceSlug="acme-corp"
          stats={{
            totalProjects: 3,
            totalTasks: 18,
            myAssignedTasks: 7,
            completedTasks: 4,
            overdueTasks: 2,
          }}
        />
      );

      expect(screen.getByText("Total Projects")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("Total Tasks")).toBeInTheDocument();
      expect(screen.getByText("18")).toBeInTheDocument();

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);

      expect(links[0]).toHaveAttribute("href", "/dashboard/acme-corp/my-tasks");
      expect(links[1]).toHaveAttribute(
        "href",
        "/dashboard/acme-corp/my-tasks?status=DONE"
      );
      expect(links[2]).toHaveAttribute(
        "href",
        "/dashboard/acme-corp/my-tasks?status=OVERDUE&overdue=true"
      );
    });
  });

  describe("RecentTasksCard", () => {
    it("renders empty state when there are no assigned tasks", () => {
      render(<RecentTasksCard workspaceSlug="acme-corp" tasks={[]} />);

      expect(screen.getByText("No tasks assigned to you")).toBeInTheDocument();
      expect(screen.getByText("Show all assigned tasks")).toBeInTheDocument();
    });

    it("renders list of tasks with status badge and due date", () => {
      const mockTasks = [
        {
          id: "task-1",
          title: "Implement Auth Flow",
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          dueDate: new Date("2026-10-15T00:00:00Z"),
          project: {
            id: "proj-1",
            name: "DevBoard Core",
            slug: "devboard-core",
          },
        },
      ];

      render(<RecentTasksCard workspaceSlug="acme-corp" tasks={mockTasks} />);

      expect(screen.getByText("Implement Auth Flow")).toBeInTheDocument();
      expect(screen.getByText("DevBoard Core")).toBeInTheDocument();
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Oct 15")).toBeInTheDocument();
    });
  });

  describe("WorkspaceProjectsCard", () => {
    it("renders empty state and Create Project button when no projects exist", () => {
      render(
        <WorkspaceProjectsCard
          workspaceId="ws-1"
          workspaceSlug="acme-corp"
          projects={[]}
        />
      );

      expect(screen.getByText("No projects yet")).toBeInTheDocument();
      expect(screen.getByText("Create Project")).toBeInTheDocument();
    });

    it("renders project rows linking to their project pages", () => {
      const mockProjects = [
        {
          id: "proj-1",
          name: "Mobile App",
          slug: "mobile-app",
          logo: null,
          _count: { tasks: 8 },
        },
      ];

      render(
        <WorkspaceProjectsCard
          workspaceId="ws-1"
          workspaceSlug="acme-corp"
          projects={mockProjects}
        />
      );

      expect(screen.getByText("Mobile App")).toBeInTheDocument();
      expect(screen.getByText("8 tasks")).toBeInTheDocument();
      const projectLink = screen.getByRole("link", { name: /Mobile App/i });
      expect(projectLink).toHaveAttribute(
        "href",
        "/dashboard/acme-corp/projects/mobile-app"
      );
    });
  });

  describe("WorkspaceTeamCard", () => {
    it("renders member count, avatar stack, and preview items", () => {
      const mockMembers = [
        {
          id: "m-1",
          role: WorkspaceRole.OWNER,
          user: {
            id: "u-1",
            name: "John Doe",
            email: "john@example.com",
            image: null,
          },
        },
        {
          id: "m-2",
          role: WorkspaceRole.MEMBER,
          user: {
            id: "u-2",
            name: "Jane Smith",
            email: "jane@example.com",
            image: null,
          },
        },
      ];

      render(
        <WorkspaceTeamCard
          workspaceSlug="acme-corp"
          memberCount={7}
          members={mockMembers}
        />
      );

      expect(screen.getByText("7 members")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      // Since memberCount=7 and 2 rendered, "+5" badge should appear
      expect(screen.getByText("+5")).toBeInTheDocument();

      const membersLink = screen.getByRole("link", {
        name: /Manage team & permissions/i,
      });
      expect(membersLink).toHaveAttribute(
        "href",
        "/dashboard/acme-corp/members"
      );
    });
  });
});
