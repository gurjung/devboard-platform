import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUpCard from "../sign-up-card";
import { useRegister } from "@/features/auth/hooks/use-register";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { en } from "@/locales/en";

// Mock dependencies
jest.mock("@/features/auth/hooks/use-register");
jest.mock("next/navigation");
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));
jest.mock("sonner");

describe("SignUpCard component", () => {
  let mockMutate: jest.Mock;
  let mockPush: jest.Mock;
  let mockRefresh: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMutate = jest.fn();
    (useRegister as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    mockPush = jest.fn();
    mockRefresh = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });
  });

  it("renders input fields and buttons correctly", () => {
    render(<SignUpCard />);

    expect(
      screen.getByPlaceholderText(
        new RegExp(en.auth.signUp.namePlaceholder, "i"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        new RegExp(en.auth.signUp.emailPlaceholder, "i"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        new RegExp(en.auth.signUp.passwordPlaceholder, "i"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: en.auth.signUp.submitButton }),
    ).toBeInTheDocument();
  });

  it("shows validation error messages when submitting empty or invalid input", async () => {
    render(<SignUpCard />);

    const submitBtn = screen.getByRole("button", {
      name: en.auth.signUp.submitButton,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(
        screen.getByText(/minimum of 8 characters required/i),
      ).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("calls mutate with registration values on valid inputs submission", async () => {
    render(<SignUpCard />);

    const nameInput = screen.getByPlaceholderText(
      new RegExp(en.auth.signUp.namePlaceholder, "i"),
    );
    const emailInput = screen.getByPlaceholderText(
      new RegExp(en.auth.signUp.emailPlaceholder, "i"),
    );
    const passwordInput = screen.getByPlaceholderText(
      new RegExp(en.auth.signUp.passwordPlaceholder, "i"),
    );
    const submitBtn = screen.getByRole("button", {
      name: en.auth.signUp.submitButton,
    });

    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    fireEvent.change(emailInput, { target: { value: "jane@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "securePassword123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          name: "Jane Doe",
          email: "jane@example.com",
          password: "securePassword123",
        },
        expect.any(Object),
      );
    });
  });

  it("triggers sign-in after successful registration mutation", async () => {
    mockMutate.mockImplementationOnce((data, callbacks) => {
      callbacks.onSuccess();
    });

    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({ error: null });

    render(<SignUpCard />);

    const nameInput = screen.getByPlaceholderText(
      new RegExp(en.auth.signUp.namePlaceholder, "i"),
    );
    const emailInput = screen.getByPlaceholderText(
      new RegExp(en.auth.signUp.emailPlaceholder, "i"),
    );
    const passwordInput = screen.getByPlaceholderText(
      new RegExp(en.auth.signUp.passwordPlaceholder, "i"),
    );
    const submitBtn = screen.getByRole("button", {
      name: en.auth.signUp.submitButton,
    });

    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    fireEvent.change(emailInput, { target: { value: "jane@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "securePassword123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "jane@example.com",
        password: "securePassword123",
        redirect: false,
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
