import React from "react";
import { render, screen } from "@testing-library/react";
import { TaskTable } from "../task-table";
import { TaskWithAssignee } from "../../hooks/use-tasks";
import { useInView } from "react-intersection-observer";

// Mock react-intersection-observer
jest.mock("react-intersection-observer");

const mockTasks: TaskWithAssignee[] = [
  {
    id: "task-1",
    title: "Task One",
    description: "Description One",
    status: "TODO",
    priority: "MEDIUM",
    projectId: "project-1",
    assigneeId: "user-1",
    createdById: "user-2",
    dueDate: new Date("2026-07-25T00:00:00.000Z"),
    createdAt: new Date(),
    updatedAt: new Date(),
    assignee: {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      image: null,
    },
    createdBy: {
      id: "user-2",
      name: "Jane Smith",
      email: "jane@example.com",
      image: null,
    },
  },
];

describe("TaskTable component", () => {
  let mockOnLoadMore: jest.Mock;
  let mockOnRowClick: jest.Mock;
  let mockOnDeleteClick: jest.Mock;
  let mockOnCreateClick: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnLoadMore = jest.fn();
    mockOnRowClick = jest.fn();
    mockOnDeleteClick = jest.fn();
    mockOnCreateClick = jest.fn();

    // Default mock implementation for useInView (not in view)
    (useInView as jest.Mock).mockReturnValue({
      ref: jest.fn(),
      inView: false,
    });
  });

  it("renders tasks and shows total count info correctly", () => {
    render(
      <TaskTable
        tasks={mockTasks}
        isLoading={false}
        isError={false}
        hasNextPage={true}
        isFetchingNextPage={false}
        onLoadMore={mockOnLoadMore}
        onRowClick={mockOnRowClick}
        onDeleteClick={mockOnDeleteClick}
        isFiltered={false}
        onCreateClick={mockOnCreateClick}
        currentUserId="user-2"
        currentUserRole="MEMBER"
        hasMultiplePages={false}
        totalTasksCount={47}
      />
    );

    expect(screen.getByText("Task One")).toBeInTheDocument();
    expect(screen.getByText("Description One")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 47 tasks")).toBeInTheDocument();
  });

  it("renders loading indicator when fetching next page", () => {
    render(
      <TaskTable
        tasks={mockTasks}
        isLoading={false}
        isError={false}
        hasNextPage={true}
        isFetchingNextPage={true}
        onLoadMore={mockOnLoadMore}
        onRowClick={mockOnRowClick}
        onDeleteClick={mockOnDeleteClick}
        isFiltered={false}
        onCreateClick={mockOnCreateClick}
        currentUserId="user-2"
        currentUserRole="MEMBER"
        hasMultiplePages={false}
        totalTasksCount={47}
      />
    );

    expect(screen.getByText("Loading more tasks...")).toBeInTheDocument();
  });

  it("renders reached the end message when hasNextPage is false and hasMultiplePages is true", () => {
    render(
      <TaskTable
        tasks={mockTasks}
        isLoading={false}
        isError={false}
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={mockOnLoadMore}
        onRowClick={mockOnRowClick}
        onDeleteClick={mockOnDeleteClick}
        isFiltered={false}
        onCreateClick={mockOnCreateClick}
        currentUserId="user-2"
        currentUserRole="MEMBER"
        hasMultiplePages={true}
        totalTasksCount={47}
      />
    );

    expect(screen.getByText("You've reached the end")).toBeInTheDocument();
  });

  it("does not render reached the end message when hasNextPage is false and hasMultiplePages is false", () => {
    render(
      <TaskTable
        tasks={mockTasks}
        isLoading={false}
        isError={false}
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={mockOnLoadMore}
        onRowClick={mockOnRowClick}
        onDeleteClick={mockOnDeleteClick}
        isFiltered={false}
        onCreateClick={mockOnCreateClick}
        currentUserId="user-2"
        currentUserRole="MEMBER"
        hasMultiplePages={false}
        totalTasksCount={47}
      />
    );

    expect(
      screen.queryByText("You've reached the end")
    ).not.toBeInTheDocument();
  });

  it("calls onLoadMore when sentinel comes into view and hasNextPage is true", () => {
    (useInView as jest.Mock).mockReturnValue({
      ref: jest.fn(),
      inView: true,
    });

    render(
      <TaskTable
        tasks={mockTasks}
        isLoading={false}
        isError={false}
        hasNextPage={true}
        isFetchingNextPage={false}
        onLoadMore={mockOnLoadMore}
        onRowClick={mockOnRowClick}
        onDeleteClick={mockOnDeleteClick}
        isFiltered={false}
        onCreateClick={mockOnCreateClick}
        currentUserId="user-2"
        currentUserRole="MEMBER"
        hasMultiplePages={false}
        totalTasksCount={47}
      />
    );

    expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does not call onLoadMore when inView is true but is already fetching", () => {
    (useInView as jest.Mock).mockReturnValue({
      ref: jest.fn(),
      inView: true,
    });

    render(
      <TaskTable
        tasks={mockTasks}
        isLoading={false}
        isError={false}
        hasNextPage={true}
        isFetchingNextPage={true}
        onLoadMore={mockOnLoadMore}
        onRowClick={mockOnRowClick}
        onDeleteClick={mockOnDeleteClick}
        isFiltered={false}
        onCreateClick={mockOnCreateClick}
        currentUserId="user-2"
        currentUserRole="MEMBER"
        hasMultiplePages={false}
        totalTasksCount={47}
      />
    );

    expect(mockOnLoadMore).not.toHaveBeenCalled();
  });
});
