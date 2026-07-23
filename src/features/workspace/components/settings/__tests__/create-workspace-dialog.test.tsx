import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateWorkspaceDialog } from "../create-workspace-dialog";
import { useCreateWorkspace } from "@/features/workspace/hooks/settings/use-create-workspace";
import { useRouter } from "next/navigation";
import { en } from "@/locales/en";

// Mock hooks and shared components
jest.mock("@/features/workspace/hooks/settings/use-create-workspace");
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

describe("CreateWorkspaceDialog component", () => {
  let mockCreateMutate: jest.Mock;
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateMutate = jest.fn();
    (useCreateWorkspace as jest.Mock).mockReturnValue({
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
      <CreateWorkspaceDialog>
        <button>Open</button>
      </CreateWorkspaceDialog>
    );

    expect(screen.getByRole("button", { name: /open/i })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        new RegExp(en.workspace.createDialog.namePlaceholder, "i")
      )
    ).toBeInTheDocument();
  });

  it("shows validation error on submission of too short workspace name", async () => {
    render(
      <CreateWorkspaceDialog>
        <button>Open</button>
      </CreateWorkspaceDialog>
    );

    const submitBtn = screen.getByRole("button", {
      name: en.workspace.createDialog.createButton,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/workspace name must be at least 2 characters/i)
      ).toBeInTheDocument();
    });

    expect(mockCreateMutate).not.toHaveBeenCalled();
  });
});
