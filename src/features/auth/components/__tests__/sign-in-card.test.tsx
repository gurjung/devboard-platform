import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignInCard from "../sign-in-card";
import { useLogin } from "@/features/auth/hooks/use-login";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { en } from "@/locales/en";

// Mock dependencies
jest.mock("@/features/auth/hooks/use-login");
jest.mock("next/navigation");
jest.mock("sonner");

describe("SignInCard component", () => {
  let mockMutate: jest.Mock;
  let mockPush: jest.Mock;
  let mockRefresh: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMutate = jest.fn();
    (useLogin as jest.Mock).mockReturnValue({
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
    render(<SignInCard />);

    expect(
      screen.getByPlaceholderText(
        new RegExp(en.auth.signIn.emailPlaceholder, "i"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        new RegExp(en.auth.signIn.passwordPlaceholder, "i"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: en.auth.signIn.submitButton }),
    ).toBeInTheDocument();
  });

  it("shows validation error messages when submitting invalid email/password", async () => {
    render(<SignInCard />);

    const submitBtn = screen.getByRole("button", {
      name: en.auth.signIn.submitButton,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("calls mutate with form credentials when inputs are valid", async () => {
    render(<SignInCard />);

    const emailInput = screen.getByPlaceholderText(
      new RegExp(en.auth.signIn.emailPlaceholder, "i"),
    );
    const passwordInput = screen.getByPlaceholderText(
      new RegExp(en.auth.signIn.passwordPlaceholder, "i"),
    );
    const submitBtn = screen.getByRole("button", {
      name: en.auth.signIn.submitButton,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { email: "test@example.com", password: "password123" },
        expect.any(Object),
      );
    });
  });

  it("displays mutation error on submission failure", async () => {
    mockMutate.mockImplementationOnce((data, callbacks) => {
      callbacks.onError(new Error("Login failed custom message"));
    });

    render(<SignInCard />);

    const emailInput = screen.getByPlaceholderText(
      new RegExp(en.auth.signIn.emailPlaceholder, "i"),
    );
    const passwordInput = screen.getByPlaceholderText(
      new RegExp(en.auth.signIn.passwordPlaceholder, "i"),
    );
    const submitBtn = screen.getByRole("button", {
      name: en.auth.signIn.submitButton,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Login failed custom message"),
      ).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("Login failed custom message");
    });
  });
});
