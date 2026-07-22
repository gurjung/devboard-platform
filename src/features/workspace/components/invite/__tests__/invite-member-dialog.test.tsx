import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InviteMemberDialog } from "../invite-member-dialog";
import { useInviteMember } from "@/features/workspace/hooks/invite/use-invite-member";
import { en } from "@/locales/en";

// Mock hooks and shared components
jest.mock("@/features/workspace/hooks/invite/use-invite-member");
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
jest.mock("../generated-invite-view", () => ({
  GeneratedInviteView: ({ inviteLink }: any) => (
    <div data-testid="generated-view">{inviteLink}</div>
  ),
}));

describe("InviteMemberDialog component", () => {
  let mockInviteMutate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockInviteMutate = jest.fn();
    (useInviteMember as jest.Mock).mockReturnValue({
      mutate: mockInviteMutate,
      isPending: false,
    });
  });

  it("renders trigger and dialog inputs successfully", () => {
    render(
      <InviteMemberDialog workspaceId="workspace-123">
        <button>Open Invite</button>
      </InviteMemberDialog>,
    );

    expect(
      screen.getByRole("button", { name: /open invite/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        new RegExp(en.workspace.invite.dialog.emailPlaceholder, "i"),
      ),
    ).toBeInTheDocument();
  });

  it("shows validation error on invalid email submit", async () => {
    render(
      <InviteMemberDialog workspaceId="workspace-123">
        <button>Open Invite</button>
      </InviteMemberDialog>,
    );

    const submitBtn = screen.getByRole("button", {
      name: en.workspace.invite.dialog.generateButton,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    expect(mockInviteMutate).not.toHaveBeenCalled();
  });
});
