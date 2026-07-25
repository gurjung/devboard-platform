import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskKanbanCard } from "../task-kanban-card";
import { TaskWithAssignee } from "../../hooks/use-tasks";

// Mock @dnd-kit/core so that it does not attempt complex drag measurements during test renders
jest.mock("@dnd-kit/core", () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    isDragging: false,
  }),
}));

const mockTask: TaskWithAssignee = {
  id: "task-1",
  title: "Test Kanban Card Title",
  description: "Test description",
  status: "TODO",
  priority: "HIGH",
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
};

describe("TaskKanbanCard component", () => {
  it("renders task details correctly", () => {
    render(<TaskKanbanCard task={mockTask} />);

    expect(screen.getByText("Test Kanban Card Title")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jul 25")).toBeInTheDocument();
  });

  it("calls onEdit handler when clicked", () => {
    const handleEdit = jest.fn();
    render(<TaskKanbanCard task={mockTask} onEdit={handleEdit} />);

    const cardElement = screen
      .getByText("Test Kanban Card Title")
      .closest("div");
    expect(cardElement).toBeInTheDocument();
    if (cardElement) {
      fireEvent.click(cardElement);
    }
    expect(handleEdit).toHaveBeenCalledWith(mockTask);
  });
});
