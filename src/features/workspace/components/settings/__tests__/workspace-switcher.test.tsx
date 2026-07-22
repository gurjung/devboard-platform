import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkspaceSwitcher } from "../workspace-switcher";
import { useWorkspaces } from "../../../hooks/settings/use-workspaces";
import { useRouter, useParams } from "next/navigation";
import { en } from "@/locales/en";

// Mock dependencies
jest.mock("../../../hooks/settings/use-workspaces");
jest.mock("next/navigation");
jest.mock("../create-workspace-dialog", () => ({
  CreateWorkspaceDialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="create-dialog">{children}</div>
  ),
}));

describe("WorkspaceSwitcher component", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useParams as jest.Mock).mockReturnValue({
      workspaceSlug: "workspace-1",
    });
  });

  it("renders loader placeholder when loading workspaces", () => {
    (useWorkspaces as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<WorkspaceSwitcher />);

    expect(
      screen.getByText(en.workspace.switcher.sectionTitle),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(en.workspace.switcher.noWorkspaces, "i")),
    ).toBeInTheDocument();
  });

  it("renders workspaces switcher with selected active workspace", () => {
    const mockWorkspaces = [
      { id: "1", name: "Workspace One", slug: "workspace-1", role: "ADMIN" },
      { id: "2", name: "Workspace Two", slug: "workspace-2", role: "MEMBER" },
    ];
    (useWorkspaces as jest.Mock).mockReturnValue({
      data: mockWorkspaces,
      isLoading: false,
    });

    render(<WorkspaceSwitcher />);

    expect(screen.getByText("Workspace One")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
  });

  it("displays no workspaces placeholder when workspace list is empty", () => {
    (useWorkspaces as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<WorkspaceSwitcher />);

    expect(
      screen.getByText(new RegExp(en.workspace.switcher.noWorkspaces, "i")),
    ).toBeInTheDocument();
  });
});
