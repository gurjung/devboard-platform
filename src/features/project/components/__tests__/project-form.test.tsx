import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProjectForm } from "../project-form";
import { useUpdateProject } from "@/features/project/hooks/use-update-project";
import { useDeleteProject } from "@/features/project/hooks/use-delete-project";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { en } from "@/locales/en";

// Mock hooks and external components
jest.mock("@/features/project/hooks/use-update-project");
jest.mock("@/features/project/hooks/use-delete-project");
jest.mock("next/navigation");
jest.mock("sonner");
jest.mock("../project-logo-uploader", () => ({
  ProjectLogoUploader: () => (
    <div data-testid="logo-uploader">Logo Uploader Mock</div>
  ),
}));
jest.mock("../project-danger-zone", () => ({
  ProjectDangerZone: ({ onDelete }: any) => (
    <div data-testid="danger-zone">
      <button data-testid="danger-delete-btn" onClick={onDelete}>
        Delete
      </button>
    </div>
  ),
}));

describe("ProjectForm component", () => {
  let mockUpdateMutate: jest.Mock;
  let mockDeleteMutate: jest.Mock;
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUpdateMutate = jest.fn();
    (useUpdateProject as jest.Mock).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    });

    mockDeleteMutate = jest.fn();
    (useDeleteProject as jest.Mock).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    });

    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it("renders project name field and save button in edit/create state", () => {
    render(<ProjectForm workspaceId="w1" workspaceSlug="wslug" />);

    expect(
      screen.getByPlaceholderText(
        new RegExp(en.project.form.namePlaceholder, "i")
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: en.project.form.saveButton })
    ).toBeInTheDocument();
  });

  it("renders project details and save button in edit mode with initialValues", () => {
    render(
      <ProjectForm
        workspaceId="w1"
        workspaceSlug="wslug"
        initialValues={{
          id: "p1",
          name: "Old Project",
          logo: "http://example.com/logo.png",
        }}
      />
    );

    const nameInput = screen.getByPlaceholderText(
      new RegExp(en.project.form.namePlaceholder, "i")
    );
    expect(nameInput).toHaveValue("Old Project");
    expect(
      screen.getByRole("button", { name: en.project.form.saveButton })
    ).toBeInTheDocument();
  });

  it("validates form values and shows error on validation failure", async () => {
    render(<ProjectForm workspaceId="w1" workspaceSlug="wslug" />);

    // Trigger input change to empty name or try submitting
    const nameInput = screen.getByPlaceholderText(
      new RegExp(en.project.form.namePlaceholder, "i")
    );
    // Initially form name is empty, but button is disabled if no changes
    // Let's set it to single char to trigger validation on submit
    fireEvent.change(nameInput, { target: { value: "A" } });

    const submitBtn = screen.getByRole("button", {
      name: en.project.form.saveButton,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/project name must be at least 2 characters/i)
      ).toBeInTheDocument();
    });

    expect(mockUpdateMutate).not.toHaveBeenCalled();
  });
});
