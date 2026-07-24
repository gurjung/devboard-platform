import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskFilters } from "../task-filters/task-filters";
import { useWorkspaceMembers } from "@/features/workspace/hooks/members/use-workspace-members";

// Mock dependencies
jest.mock("@/features/workspace/hooks/members/use-workspace-members");

jest.mock("@/components/ui/select", () => {
  const SelectTrigger = ({ children }: any) => <div>{children}</div>;
  const SelectValue = ({ children }: any) => <span>{children}</span>;

  return {
    SelectTrigger,
    SelectValue,
    Select: ({ children, value, onValueChange }: any) => {
      const triggers: React.ReactNode[] = [];
      const options: React.ReactNode[] = [];

      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            triggers.push(child);
          } else {
            options.push(child);
          }
        }
      });

      return (
        <div>
          <div data-testid="select-trigger-container">{triggers}</div>
          <select value={value} onChange={(e) => onValueChange(e.target.value)}>
            {options}
          </select>
        </div>
      );
    },
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectGroup: ({ children }: any) => <>{children}</>,
    SelectItem: ({ value }: any) => <option value={value}>{value}</option>,
  };
});

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => (
    <div data-testid="popover-wrapper">{children}</div>
  ),
  PopoverTrigger: ({ children, render }: any) => (
    <div data-testid="popover-trigger">{render || children}</div>
  ),
  PopoverContent: ({ children }: any) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

jest.mock("@/components/ui/calendar", () => ({
  Calendar: ({ selected, onSelect }: any) => (
    <input
      type="date"
      data-testid="calendar-input"
      value={selected ? new Date(selected).toISOString().split("T")[0] : ""}
      onChange={(e) => {
        onSelect(e.target.value ? new Date(e.target.value) : undefined);
      }}
    />
  ),
}));

describe("TaskFilters component", () => {
  let mockOnStatusChange: jest.Mock;
  let mockOnPriorityChange: jest.Mock;
  let mockOnAssigneeChange: jest.Mock;
  let mockOnDueDateChange: jest.Mock;
  let mockOnClearFilters: jest.Mock;

  const mockMembers = [
    {
      id: "member-1",
      workspaceId: "workspace-1",
      userId: "user-1",
      role: "MEMBER",
      user: {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        image: null,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnStatusChange = jest.fn();
    mockOnPriorityChange = jest.fn();
    mockOnAssigneeChange = jest.fn();
    mockOnDueDateChange = jest.fn();
    mockOnClearFilters = jest.fn();

    (useWorkspaceMembers as jest.Mock).mockReturnValue({
      data: mockMembers,
      isLoading: false,
    });
  });

  it("renders status, priority, assignee and due date triggers", () => {
    render(
      <TaskFilters
        workspaceId="workspace-1"
        status=""
        priority=""
        assigneeId=""
        dueDate=""
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onAssigneeChange={mockOnAssigneeChange}
        onDueDateChange={mockOnDueDateChange}
        onClearFilters={mockOnClearFilters}
        isFiltered={false}
      />
    );

    expect(screen.getByText(/status:/i)).toBeInTheDocument();
    expect(screen.getByText(/priority:/i)).toBeInTheDocument();
    expect(screen.getByText(/assignee:/i)).toBeInTheDocument();
    expect(screen.getByText(/due date:/i)).toBeInTheDocument();
  });

  it("fires onStatusChange callback when status dropdown option changes", () => {
    render(
      <TaskFilters
        workspaceId="workspace-1"
        status=""
        priority=""
        assigneeId=""
        dueDate=""
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onAssigneeChange={mockOnAssigneeChange}
        onDueDateChange={mockOnDueDateChange}
        onClearFilters={mockOnClearFilters}
        isFiltered={false}
      />
    );

    const select = screen.getAllByRole("combobox")[0]; // Status Select
    fireEvent.change(select, { target: { value: "TODO" } });

    expect(mockOnStatusChange).toHaveBeenCalledWith("TODO");
  });

  it("fires onPriorityChange callback when priority dropdown option changes", () => {
    render(
      <TaskFilters
        workspaceId="workspace-1"
        status=""
        priority=""
        assigneeId=""
        dueDate=""
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onAssigneeChange={mockOnAssigneeChange}
        onDueDateChange={mockOnDueDateChange}
        onClearFilters={mockOnClearFilters}
        isFiltered={false}
      />
    );

    const select = screen.getAllByRole("combobox")[1]; // Priority Select
    fireEvent.change(select, { target: { value: "HIGH" } });

    expect(mockOnPriorityChange).toHaveBeenCalledWith("HIGH");
  });

  it("fires onAssigneeChange callback when assignee dropdown option changes", () => {
    render(
      <TaskFilters
        workspaceId="workspace-1"
        status=""
        priority=""
        assigneeId=""
        dueDate=""
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onAssigneeChange={mockOnAssigneeChange}
        onDueDateChange={mockOnDueDateChange}
        onClearFilters={mockOnClearFilters}
        isFiltered={false}
      />
    );

    const select = screen.getAllByRole("combobox")[2]; // Assignee Select
    fireEvent.change(select, { target: { value: "user-1" } });

    expect(mockOnAssigneeChange).toHaveBeenCalledWith("user-1");
  });

  it("renders clear all filters button if isFiltered is true, and handles click callback", () => {
    const { rerender } = render(
      <TaskFilters
        workspaceId="workspace-1"
        status=""
        priority=""
        assigneeId=""
        dueDate=""
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onAssigneeChange={mockOnAssigneeChange}
        onDueDateChange={mockOnDueDateChange}
        onClearFilters={mockOnClearFilters}
        isFiltered={false}
      />
    );

    expect(
      screen.queryByRole("button", { name: /clear filters/i })
    ).not.toBeInTheDocument();

    rerender(
      <TaskFilters
        workspaceId="workspace-1"
        status=""
        priority=""
        assigneeId=""
        dueDate=""
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onAssigneeChange={mockOnAssigneeChange}
        onDueDateChange={mockOnDueDateChange}
        onClearFilters={mockOnClearFilters}
        isFiltered={true}
      />
    );

    const clearButton = screen.getByRole("button", { name: /clear filters/i });
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  it("handles clearing single status filter when clear status trigger is clicked", () => {
    render(
      <TaskFilters
        workspaceId="workspace-1"
        status="TODO"
        priority=""
        assigneeId=""
        dueDate=""
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onAssigneeChange={mockOnAssigneeChange}
        onDueDateChange={mockOnDueDateChange}
        onClearFilters={mockOnClearFilters}
        isFiltered={true}
      />
    );

    const clearStatusTrigger = screen.getByTitle("Clear Status Filter");
    expect(clearStatusTrigger).toBeInTheDocument();

    fireEvent.click(clearStatusTrigger);
    expect(mockOnStatusChange).toHaveBeenCalledWith("");
  });

  it("handles calendar date pick trigger", () => {
    render(
      <TaskFilters
        workspaceId="workspace-1"
        status=""
        priority=""
        assigneeId=""
        dueDate=""
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onAssigneeChange={mockOnAssigneeChange}
        onDueDateChange={mockOnDueDateChange}
        onClearFilters={mockOnClearFilters}
        isFiltered={false}
      />
    );

    const calendarInput = screen.getByTestId("calendar-input");
    fireEvent.change(calendarInput, { target: { value: "2026-08-25" } });

    expect(mockOnDueDateChange).toHaveBeenCalledWith("2026-08-25");
  });
});
