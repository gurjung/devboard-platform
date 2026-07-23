import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateProjectDialog } from "../create-project-dialog";
import { useCreateProject } from "@/features/project/hooks/use-create-project";
import { useRouter } from "next/navigation";
import { en } from "@/locales/en";

// Mock hooks and shared components
jest.mock("@/features/project/hooks/use-create-project");
jest.mock("next/navigation");
jest.mock("@/components/shared/form-dialog", () => ({
  FormDialog: ({ children, trigger }: any) => (
    <div data-testid="form-dialog">
      {trigger}
      {children}
    </div>
  ),
}));
jest.mock("@/components/shared/dialog-actions", () => ({
  DialogActions: ({ completeLabel, onCancel }: any) => (
    <div>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit">{completeLabel}</button>
    </div>
  ),
}));

describe("CreateProjectDialog component", () => {
  let mockCreateMutate: jest.Mock;
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateMutate = jest.fn();
    (useCreateProject as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    });

    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it("renders trigger and dialog input form elements", () => {
    render(
      <CreateProjectDialog workspaceId="w1" workspaceSlug="wslug">
        <button>Open</button>
      </CreateProjectDialog>
    );

    expect(screen.getByRole("button", { name: /open/i })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        new RegExp(en.project.createDialog.namePlaceholder, "i")
      )
    ).toBeInTheDocument();
  });

  it("shows validation error on submission of too short project name", async () => {
    render(
      <CreateProjectDialog workspaceId="w1" workspaceSlug="wslug">
        <button>Open</button>
      </CreateProjectDialog>
    );

    const submitBtn = screen.getByRole("button", {
      name: en.project.createDialog.createButton,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/project name must be at least 2 characters/i)
      ).toBeInTheDocument();
    });

    expect(mockCreateMutate).not.toHaveBeenCalled();
  });
});
