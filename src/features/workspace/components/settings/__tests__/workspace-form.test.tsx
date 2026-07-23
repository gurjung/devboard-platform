import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WorkspaceForm } from "../workspace-form";
import { useCreateWorkspace } from "@/features/workspace/hooks/settings/use-create-workspace";
import { useUpdateWorkspace } from "@/features/workspace/hooks/settings/use-update-workspace";
import { useDeleteWorkspace } from "@/features/workspace/hooks/settings/use-delete-workspace";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { en } from "@/locales/en";

// Mock hooks and external components
jest.mock("@/features/workspace/hooks/settings/use-create-workspace");
jest.mock("@/features/workspace/hooks/settings/use-update-workspace");
jest.mock("@/features/workspace/hooks/settings/use-delete-workspace");
jest.mock("next/navigation");
jest.mock("sonner");
jest.mock("../../invite/invite-member-dialog", () => ({
  InviteMemberDialog: ({ children }: any) => (
    <div data-testid="invite-dialog">{children}</div>
  ),
}));
jest.mock("../workspace-logo-uploader", () => ({
  WorkspaceLogoUploader: () => (
    <div data-testid="logo-uploader">Logo Uploader Mock</div>
  ),
}));

describe("WorkspaceForm component", () => {
  let mockCreateMutate: jest.Mock;
  let mockUpdateMutate: jest.Mock;
  let mockDeleteMutate: jest.Mock;
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateMutate = jest.fn();
    (useCreateWorkspace as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    });

    mockUpdateMutate = jest.fn();
    (useUpdateWorkspace as jest.Mock).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    });

    mockDeleteMutate = jest.fn();
    (useDeleteWorkspace as jest.Mock).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    });

    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it("renders workspace name field and create button in create mode", () => {
    render(<WorkspaceForm mode="create" />);

    expect(
      screen.getByPlaceholderText(
        new RegExp(en.workspace.form.namePlaceholder, "i")
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: en.workspace.form.createButton })
    ).toBeInTheDocument();
  });

  it("renders workspace details and save button in edit mode", () => {
    render(
      <WorkspaceForm
        mode="edit"
        initialValues={{
          id: "123",
          name: "Old Workspace",
          logo: "http://example.com/logo.png",
        }}
      />
    );

    const nameInput = screen.getByPlaceholderText(
      new RegExp(en.workspace.form.namePlaceholder, "i")
    );
    expect(nameInput).toHaveValue("Old Workspace");
    expect(
      screen.getByRole("button", { name: en.workspace.form.saveButton })
    ).toBeInTheDocument();
  });

  it("validates form values and shows error on validation failure", async () => {
    render(<WorkspaceForm mode="create" />);

    const submitBtn = screen.getByRole("button", {
      name: en.workspace.form.createButton,
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
