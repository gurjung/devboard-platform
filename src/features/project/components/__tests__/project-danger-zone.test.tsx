import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectDangerZone } from "../project-danger-zone";
import { en } from "@/locales/en";

// Mock the dialog
jest.mock("@/components/shared/confirm-dialog", () => ({
  ConfirmDialog: ({ open, onConfirm, confirmLabel }: any) => {
    if (!open) return null;
    return (
      <div data-testid="confirm-dialog">
        <button data-testid="confirm-delete-btn" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    );
  },
}));

describe("ProjectDangerZone component", () => {
  it("renders correctly with delete button", () => {
    const onDelete = jest.fn();
    render(<ProjectDangerZone onDelete={onDelete} />);

    expect(
      screen.getByText(new RegExp(en.project.dangerZone.title, "i"))
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(en.project.dangerZone.deleteButton, "i"),
      })
    ).toBeInTheDocument();
  });

  it("opens confirmation dialog and triggers onDelete", () => {
    const onDelete = jest.fn();
    render(<ProjectDangerZone onDelete={onDelete} />);

    // Initially dialog is closed
    expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();

    // Click delete
    const deleteBtn = screen.getByRole("button", {
      name: new RegExp(en.project.dangerZone.deleteButton, "i"),
    });
    fireEvent.click(deleteBtn);

    // Dialog is open
    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();

    // Confirm delete
    const confirmBtn = screen.getByTestId("confirm-delete-btn");
    fireEvent.click(confirmBtn);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
