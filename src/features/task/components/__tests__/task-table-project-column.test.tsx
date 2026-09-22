import React from "react";
import { render, screen } from "@testing-library/react";
import { TaskTable } from "../task-table/task-table";
import { TaskFilters } from "../task-filters/task-filters";
import { TaskWithAssignee } from "../../hooks/use-tasks";
import { useInView } from "react-intersection-observer";

jest.mock("react-intersection-observer");
jest.mock("next/navigation", () => ({
  useParams: () => ({ workspaceSlug: "workspace-slug-1" }),
}));
jest.mock("@/features/workspace/hooks/members/use-workspace-members", () => ({
  useWorkspaceMembers: () => ({ data: [], isLoading: false }),
}));

const mockTasks: TaskWithAssignee[] = [
  {
    id: "task-1",
    title: "My Important Task",
    description: "Task description",
    status: "TODO",
    priority: "URGENT",
    projectId: "project-1",
    assigneeId: "user-1",
    createdById: "user-2",
    dueDate: new Date("2026-09-30T00:00:00.000Z"),
    createdAt: new Date(),
    updatedAt: new Date(),
    project: {
      id: "project-1",
      name: "DevBoard Core",
      slug: "devboard-core",
    },
    assignee: {
      id: "user-1",
      name: "Current User",
      email: "user@example.com",
      image: null,
    },
    createdBy: {
      id: "user-2",
      name: "Admin User",
      email: "admin@example.com",
      image: null,
    },
  },
];

describe("TaskTable with showProjectColumn", () => {
  beforeEach(() => {
    (useInView as jest.Mock).mockReturnValue({
      ref: jest.fn(),
      inView: false,
    });
  });

  it("renders Project column header and project link when showProjectColumn is true", () => {
    render(
      <TaskTable
        tasks={mockTasks}
        isLoading={false}
        isError={false}
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={jest.fn()}
        onRowClick={jest.fn()}
        onDeleteClick={jest.fn()}
        isFiltered={false}
        currentUserId="user-1"
        currentUserRole="MEMBER"
        hasMultiplePages={false}
        totalTasksCount={1}
        showProjectColumn={true}
        workspaceSlug="workspace-slug-1"
      />
    );

    expect(screen.getByText("Project")).toBeInTheDocument();
    const projectLink = screen.getByRole("link", { name: "DevBoard Core" });
    expect(projectLink).toBeInTheDocument();
    expect(projectLink).toHaveAttribute(
      "href",
      "/dashboard/workspace-slug-1/projects/devboard-core"
    );
  });

  it("does not render Project column when showProjectColumn is false", () => {
    render(
      <TaskTable
        tasks={mockTasks}
        isLoading={false}
        isError={false}
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={jest.fn()}
        onRowClick={jest.fn()}
        onDeleteClick={jest.fn()}
        isFiltered={false}
        currentUserId="user-1"
        currentUserRole="MEMBER"
        hasMultiplePages={false}
        totalTasksCount={1}
        showProjectColumn={false}
      />
    );

    expect(screen.queryByText("Project")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "DevBoard Core" })
    ).not.toBeInTheDocument();
  });

  it("handles very large description with truncation and title tooltip", () => {
    const hugeDescription =
      "A".repeat(500) +
      " very long description with continuous characters and details";
    const taskWithHugeDesc: TaskWithAssignee = {
      ...mockTasks[0],
      id: "task-huge",
      title: "Task with Huge Description",
      description: hugeDescription,
    };

    render(
      <TaskTable
        tasks={[taskWithHugeDesc]}
        isLoading={false}
        isError={false}
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={jest.fn()}
        onRowClick={jest.fn()}
        onDeleteClick={jest.fn()}
        isFiltered={false}
        currentUserId="user-1"
        currentUserRole="MEMBER"
        hasMultiplePages={false}
        totalTasksCount={1}
        showProjectColumn={true}
      />
    );

    const descElement = screen.getByTitle(hugeDescription);
    expect(descElement).toBeInTheDocument();
    expect(descElement).toHaveClass("truncate");
  });
});

describe("TaskFilters with hideAssignee", () => {
  it("hides assignee filter when hideAssignee is true", () => {
    render(
      <TaskFilters
        workspaceId="workspace-1"
        status=""
        priority=""
        dueDate=""
        onStatusChange={jest.fn()}
        onPriorityChange={jest.fn()}
        onDueDateChange={jest.fn()}
        onClearFilters={jest.fn()}
        isFiltered={false}
        hideAssignee={true}
      />
    );

    expect(screen.queryByText(/assignee:/i)).not.toBeInTheDocument();
    expect(screen.getByText(/status:/i)).toBeInTheDocument();
    expect(screen.getByText(/priority:/i)).toBeInTheDocument();
    expect(screen.getByText(/due date:/i)).toBeInTheDocument();
  });
});
