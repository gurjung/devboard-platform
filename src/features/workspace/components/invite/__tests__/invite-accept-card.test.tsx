import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InviteAcceptCard } from "../invite-accept-card";
import { en } from "@/locales/en";

describe("InviteAcceptCard component", () => {
  const mockData = {
    workspaceName: "Team Workspace",
    email: "test@example.com",
    role: "MEMBER",
  };

  it("renders workspace invite details correctly", () => {
    render(
      <InviteAcceptCard
        accepting={false}
        onAcceptInvite={jest.fn()}
        data={mockData}
      />
    );

    expect(
      screen.getByText(en.workspace.invite.accept.title)
    ).toBeInTheDocument();
    expect(screen.getByText("Team Workspace")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("triggers accept handler when accept button is clicked", () => {
    const onAcceptInvite = jest.fn();
    render(
      <InviteAcceptCard
        accepting={false}
        onAcceptInvite={onAcceptInvite}
        data={mockData}
      />
    );

    const acceptBtn = screen.getByRole("button", {
      name: en.workspace.invite.accept.acceptButton,
    });
    fireEvent.click(acceptBtn);

    expect(onAcceptInvite).toHaveBeenCalledTimes(1);
  });

  it("disables button and shows loading text when accepting is true", () => {
    render(
      <InviteAcceptCard
        accepting={true}
        onAcceptInvite={jest.fn()}
        data={mockData}
      />
    );

    const acceptBtn = screen.getByRole("button", {
      name: en.workspace.invite.accept.acceptingButton,
    });
    expect(acceptBtn).toBeDisabled();
  });
});
