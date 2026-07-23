import React from "react";
import { render, screen } from "@testing-library/react";
import { ProjectSwitcher } from "../project-switcher";
import { useWorkspaces } from "@/features/workspace/hooks/settings/use-workspaces";
import { useProjects } from "../../hooks/use-projects";
import { useRouter, useParams } from "next/navigation";
import { en } from "@/locales/en";

// Mock dependencies
jest.mock("@/features/workspace/hooks/settings/use-workspaces");
jest.mock("../../hooks/use-projects");
jest.mock("next/navigation");
jest.mock("../create-project-dialog", () => ({
  CreateProjectDialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="create-dialog">{children}</div>
  ),
}));

describe("ProjectSwitcher component", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useParams as jest.Mock).mockReturnValue({
      workspaceSlug: "workspace-1",
      projectSlug: "project-1",
    });
  });

  it("renders loading placeholder when fetching projects", () => {
    (useWorkspaces as jest.Mock).mockReturnValue({
      data: [{ id: "w1", slug: "workspace-1", name: "Workspace One" }],
      isLoading: false,
    });
    (useProjects as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<ProjectSwitcher />);

    expect(
      screen.getByText(en.project.switcher.sectionTitle)
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(en.project.switcher.noProjects, "i"))
    ).toBeInTheDocument();
  });

  it("renders projects switcher with selected active project", () => {
    const mockWorkspaces = [
      { id: "w1", name: "Workspace One", slug: "workspace-1" },
    ];
    const mockProjects = [
      { id: "p1", name: "Project One", slug: "project-1" },
      { id: "p2", name: "Project Two", slug: "project-2" },
    ];

    (useWorkspaces as jest.Mock).mockReturnValue({
      data: mockWorkspaces,
      isLoading: false,
    });
    (useProjects as jest.Mock).mockReturnValue({
      data: mockProjects,
      isLoading: false,
    });

    render(<ProjectSwitcher />);

    expect(screen.getByText("Project One")).toBeInTheDocument();
  });

  it("displays no projects placeholder when project list is empty", () => {
    (useWorkspaces as jest.Mock).mockReturnValue({
      data: [{ id: "w1", slug: "workspace-1", name: "Workspace One" }],
      isLoading: false,
    });
    (useProjects as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<ProjectSwitcher />);

    expect(
      screen.getByText(new RegExp(en.project.switcher.noProjects, "i"))
    ).toBeInTheDocument();
  });
});
