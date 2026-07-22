import React from "react";
import { render, screen } from "@testing-library/react";
import { MembersList } from "../members-list";
import { useWorkspaceMembers } from "@/features/workspace/hooks/members/use-workspace-members";
import { useUpdateMemberRole } from "@/features/workspace/hooks/members/use-update-member-role";
import { useRemoveMember } from "@/features/workspace/hooks/members/use-remove-member";
import { WORKSPACE_ROLES } from "@/features/workspace/constants";

// Mock hooks
jest.mock("@/features/workspace/hooks/members/use-workspace-members");
jest.mock("@/features/workspace/hooks/members/use-update-member-role");
jest.mock("@/features/workspace/hooks/members/use-remove-member");

// Mock sub-components to keep list tests simple
jest.mock("../member-card", () => ({
  MemberCard: ({ member }: any) => (
    <div data-testid="member-card">{member.user.name}</div>
  ),
}));
jest.mock("../members-list-skeleton", () => ({
  MembersListSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));
jest.mock("../members-list-error", () => ({
  MembersListError: ({ message }: any) => (
    <div data-testid="error-state">{message}</div>
  ),
}));
jest.mock("@/components/shared/confirm-dialog", () => ({
  ConfirmDialog: () => null,
}));

describe("MembersList component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useUpdateMemberRole as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    (useRemoveMember as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it("renders loader skeleton when loading members list", () => {
    (useWorkspaceMembers as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(
      <MembersList
        workspaceId="ws-1"
        currentUserId="user-1"
        currentUserRole={WORKSPACE_ROLES.OWNER}
      />,
    );

    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("renders error state when api fails", () => {
    (useWorkspaceMembers as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Failed to load members"),
    });

    render(
      <MembersList
        workspaceId="ws-1"
        currentUserId="user-1"
        currentUserRole={WORKSPACE_ROLES.OWNER}
      />,
    );

    expect(screen.getByTestId("error-state")).toHaveTextContent(
      "Failed to load members",
    );
  });

  it("renders list of MemberCard components when data is loaded successfully", () => {
    const mockMembers = [
      { id: "1", user: { name: "Alice" } },
      { id: "2", user: { name: "Bob" } },
    ];
    (useWorkspaceMembers as jest.Mock).mockReturnValue({
      data: mockMembers,
      isLoading: false,
      isError: false,
    });

    render(
      <MembersList
        workspaceId="ws-1"
        currentUserId="user-1"
        currentUserRole={WORKSPACE_ROLES.OWNER}
      />,
    );

    const cards = screen.getAllByTestId("member-card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Alice");
    expect(cards[1]).toHaveTextContent("Bob");
  });
});
