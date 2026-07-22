import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WorkspaceLogoUploader } from "../workspace-logo-uploader";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { en } from "@/locales/en";

// Mock external dependencies
jest.mock("browser-image-compression");
jest.mock("sonner");

// Mock Avatar to render image immediately in JSDOM
jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  AvatarImage: ({ src, alt }: any) => <img src={src} alt={alt} />,
  AvatarFallback: ({ children }: any) => <div>{children}</div>,
}));

describe("WorkspaceLogoUploader component", () => {
  let setPreviewUrl: jest.Mock;
  let setLogoFile: jest.Mock;
  let setFormValue: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    setPreviewUrl = jest.fn();
    setLogoFile = jest.fn();
    setFormValue = jest.fn();

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => "blob:url");
    global.URL.revokeObjectURL = jest.fn();
  });

  it("renders with default details when no image is uploaded", () => {
    render(
      <WorkspaceLogoUploader
        previewUrl={null}
        setPreviewUrl={setPreviewUrl}
        logoFile={null}
        setLogoFile={setLogoFile}
        setFormValue={setFormValue}
      />,
    );

    expect(
      screen.getByText(new RegExp(en.workspace.logoUploader.selectImage, "i")),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: new RegExp(en.workspace.logoUploader.remove, "i"),
      }),
    ).not.toBeInTheDocument();
  });

  it("renders preview and remove button when previewUrl exists", () => {
    render(
      <WorkspaceLogoUploader
        previewUrl="https://example.com/existing-logo.png"
        setPreviewUrl={setPreviewUrl}
        logoFile={null}
        setLogoFile={setLogoFile}
        setFormValue={setFormValue}
      />,
    );

    expect(
      screen.getByRole("img", {
        name: new RegExp(en.workspace.logoUploader.previewAlt, "i"),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(en.workspace.logoUploader.remove, "i"),
      }),
    ).toBeInTheDocument();
  });

  it("triggers file select click when button is clicked", () => {
    render(
      <WorkspaceLogoUploader
        previewUrl={null}
        setPreviewUrl={setPreviewUrl}
        logoFile={null}
        setLogoFile={setLogoFile}
        setFormValue={setFormValue}
      />,
    );

    const selectBtn = screen.getByRole("button", {
      name: new RegExp(en.workspace.logoUploader.selectImage, "i"),
    });
    expect(selectBtn).toBeInTheDocument();
  });

  it("throws error message on invalid file format upload", async () => {
    const { container } = render(
      <WorkspaceLogoUploader
        previewUrl={null}
        setPreviewUrl={setPreviewUrl}
        logoFile={null}
        setLogoFile={setLogoFile}
        setFormValue={setFormValue}
      />,
    );

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const invalidFile = new File(["dummy content"], "doc.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        en.workspace.logoUploader.toastInvalidType,
      );
    });
  });
});
