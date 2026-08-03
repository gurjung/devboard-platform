import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { TaskCalendarBoard } from "../task-calendar/task-calendar-board";
import { useTasks, TaskWithAssignee } from "../../hooks/use-tasks";
import { useUpdateTask } from "../../hooks/use-update-task";
import { useQueryClient, useMutationState } from "@tanstack/react-query";
import { format } from "date-fns";

// Mock react-query
jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
  useMutationState: jest.fn(),
}));

// Mock hooks
jest.mock("../../hooks/use-tasks");
jest.mock("../../hooks/use-update-task");

// Mock @dnd-kit/core
jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  useSensor: jest.fn(),
  useSensors: jest.fn(),
  PointerSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
  DragOverlay: ({ children }: any) => <div>{children}</div>,
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    isDragging: false,
  }),
}));

// Mock UI Popover
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

// Mock UI Select
jest.mock("@/components/ui/select", () => {
  const SelectTrigger = ({ children }: any) => <div>{children}</div>;
  const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;

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
          <select
            data-testid="mock-select"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
          >
            {options}
          </select>
        </div>
      );
    },
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ value, children }: any) => (
      <option value={value}>{children || value}</option>
    ),
  };
});

const mockTasks: TaskWithAssignee[] = [
  {
    id: "task-1",
    title: "Task With Due Date",
    description: "Description One",
    status: "TODO",
    priority: "HIGH",
    projectId: "project-1",
    assigneeId: "user-1",
    createdById: "user-2",
    dueDate: new Date("2026-08-15T00:00:00.000Z"),
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
  {
    id: "task-2",
    title: "Task Without Due Date",
    description: "Description Two",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    projectId: "project-1",
    assigneeId: null,
    createdById: "user-2",
    dueDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignee: null,
    createdBy: {
      id: "user-2",
      name: "Jane Smith",
      email: "jane@example.com",
      image: null,
    },
  },
];

describe("TaskCalendarBoard component", () => {
  let mockOnTaskClick: jest.Mock;
  let mockMutate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnTaskClick = jest.fn();
    mockMutate = jest.fn();

    // Mock query client
    (useQueryClient as jest.Mock).mockReturnValue({
      cancelQueries: jest.fn(),
      getQueryData: jest.fn(),
      setQueryData: jest.fn(),
      invalidateQueries: jest.fn(),
    });

    // Mock pending mutations state
    (useMutationState as jest.Mock).mockReturnValue([]);

    // Mock useTasks implementation
    (useTasks as jest.Mock).mockReturnValue({
      data: {
        pages: [{ tasks: mockTasks, nextCursor: null, totalCount: 2 }],
      },
      isLoading: false,
      isError: false,
    });

    // Mock useUpdateTask implementation
    (useUpdateTask as jest.Mock).mockReturnValue({
      mutate: mockMutate,
    });
  });

  it("renders month grid correctly and sets default month based on current local date", () => {
    // Current local date in tests will be derived from new Date()
    render(
      <TaskCalendarBoard
        projectId="project-1"
        searchParams={{}}
        onTaskClick={mockOnTaskClick}
      />
    );

    // Verify it renders selectors initialized to current month and year
    const selects = screen.getAllByTestId("mock-select");
    expect(selects).toHaveLength(2);

    const [monthSelect, yearSelect] = selects;
    expect((monthSelect as HTMLSelectElement).value).toBe(
      new Date().getMonth().toString()
    );
    expect((yearSelect as HTMLSelectElement).value).toBe(
      new Date().getFullYear().toString()
    );

    // Verify week labels
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();

    // Verify both tasks are visible in the board
    expect(screen.getByText("Task With Due Date")).toBeInTheDocument();
    expect(screen.getByText("Task Without Due Date")).toBeInTheDocument();
  });

  it("navigates forward and backward in month grid", () => {
    render(
      <TaskCalendarBoard
        projectId="project-1"
        searchParams={{}}
        onTaskClick={mockOnTaskClick}
      />
    );

    const prevButton = screen.getByTitle("Previous Month");
    const nextButton = screen.getByTitle("Next Month");
    const selects = screen.getAllByTestId("mock-select");
    const [monthSelect, yearSelect] = selects;

    // Click next month
    fireEvent.click(nextButton);
    const nextDate = addMonths(new Date(), 1);
    expect((monthSelect as HTMLSelectElement).value).toBe(
      nextDate.getMonth().toString()
    );
    expect((yearSelect as HTMLSelectElement).value).toBe(
      nextDate.getFullYear().toString()
    );

    // Click prev month
    fireEvent.click(prevButton);
    fireEvent.click(prevButton);
    const prevDate = subMonths(new Date(), 1);
    expect((monthSelect as HTMLSelectElement).value).toBe(
      prevDate.getMonth().toString()
    );
    expect((yearSelect as HTMLSelectElement).value).toBe(
      prevDate.getFullYear().toString()
    );

    // Click today
    const todayButton = screen.getByText("Today");
    fireEvent.click(todayButton);
    expect((monthSelect as HTMLSelectElement).value).toBe(
      new Date().getMonth().toString()
    );
    expect((yearSelect as HTMLSelectElement).value).toBe(
      new Date().getFullYear().toString()
    );
  });

  it("allows selecting month and year from dropdown picker", () => {
    render(
      <TaskCalendarBoard
        projectId="project-1"
        searchParams={{}}
        onTaskClick={mockOnTaskClick}
      />
    );

    const selects = screen.getAllByTestId("mock-select");
    const [monthSelect, yearSelect] = selects;

    // Change Month to October (value: "9")
    fireEvent.change(monthSelect, { target: { value: "9" } });
    expect((monthSelect as HTMLSelectElement).value).toBe("9");

    // Change Year to 2028 (value: "2028")
    fireEvent.change(yearSelect, { target: { value: "2028" } });
    expect((yearSelect as HTMLSelectElement).value).toBe("2028");
  });

  it("renders undated tasks inside the Sidebar Panel", () => {
    render(
      <TaskCalendarBoard
        projectId="project-1"
        searchParams={{}}
        onTaskClick={mockOnTaskClick}
      />
    );

    // Sidebar should have "No due date" title
    const sidebarTitle = screen.getByRole("heading", { name: "No due date" });
    expect(sidebarTitle).toBeInTheDocument();

    // The task "Task Without Due Date" should reside in the sidebar
    const sidebarContainer = sidebarTitle.closest("div")?.nextElementSibling;
    expect(sidebarContainer).toBeInTheDocument();
    if (sidebarContainer) {
      expect(
        within(sidebarContainer as HTMLElement).getByText(
          "Task Without Due Date"
        )
      ).toBeInTheDocument();
    }
  });

  it("triggers onTaskClick handler when clicking a task card", () => {
    render(
      <TaskCalendarBoard
        projectId="project-1"
        searchParams={{}}
        onTaskClick={mockOnTaskClick}
      />
    );

    const taskCardText = screen.getByText("Task With Due Date");
    fireEvent.click(taskCardText);
    expect(mockOnTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });
});

// Helpers to add or subtract months
function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function subMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}
