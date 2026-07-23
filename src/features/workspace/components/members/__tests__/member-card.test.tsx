import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemberCard } from "../member-card";
import { WORKSPACE_ROLES } from "@/features/workspace/constants";
import { en } from "@/locales/en";

// Mock Avatar to render image immediately in JSDOM
jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  AvatarImage: ({ src, alt }: any) => <img src={src} alt={alt} />,
  AvatarFallback: ({ children }: any) => <div>{children}</div>,
}));

// Mock Select elements to simplify dropdown interaction tests
jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select
      data-testid="role-select"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
}));

describe("MemberCard component", () => {
  const mockMember = {
    id: "member-1",
    workspaceId: "ws-1",
    userId: "user-1",
    role: WORKSPACE_ROLES.MEMBER as any,
    createdAt: new Date().toISOString(),
    user: {
      id: "user-1",
      name: "Alice Smith",
      email: "alice@example.com",
      image: "https://example.com/alice.png",
    },
  };

  it("renders member details correctly", () => {
    render(
      <MemberCard
        member={mockMember}
        currentUserId="user-2"
        currentUserRole={WORKSPACE_ROLES.MEMBER}
        onRoleChange={jest.fn()}
        onRemove={jest.fn()}
      />
    );

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(
      screen.getByText(en.workspace.members.roles.member)
    ).toBeInTheDocument();
  });

  it("renders select dropdown and fires onRoleChange when active user is Owner", () => {
    const onRoleChange = jest.fn();
    render(
      <MemberCard
        member={mockMember}
        currentUserId="user-2"
        currentUserRole={WORKSPACE_ROLES.OWNER}
        onRoleChange={onRoleChange}
        onRemove={jest.fn()}
      />
    );

    const select = screen.getByTestId("role-select");
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "ADMIN" } });
    expect(onRoleChange).toHaveBeenCalledWith(mockMember, "ADMIN");
  });

  it("renders kick button and triggers onRemove when active user is Owner", () => {
    const onRemove = jest.fn();
    render(
      <MemberCard
        member={mockMember}
        currentUserId="user-2"
        currentUserRole={WORKSPACE_ROLES.OWNER}
        onRoleChange={jest.fn()}
        onRemove={onRemove}
      />
    );

    const kickBtn = screen.getByRole("button", {
      name: en.workspace.members.removeTooltip,
    });
    expect(kickBtn).toBeInTheDocument();

    fireEvent.click(kickBtn);
    expect(onRemove).toHaveBeenCalledWith(mockMember);
  });
});
