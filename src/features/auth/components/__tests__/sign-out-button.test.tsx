import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SignOutButton } from "../sign-out-button";
import { signOut } from "next-auth/react";
import { en } from "@/locales/en";
import { AUTH_ROUTES } from "@/lib/constants";

jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}));

describe("SignOutButton component", () => {
  it("renders correctly with localized text", () => {
    render(<SignOutButton />);
    const button = screen.getByRole("button", {
      name: new RegExp(en.auth.signOut.button, "i"),
    });
    expect(button).toBeInTheDocument();
  });

  it("calls signOut from next-auth/react with correct callback URL on click", () => {
    render(<SignOutButton />);
    const button = screen.getByRole("button", {
      name: new RegExp(en.auth.signOut.button, "i"),
    });

    fireEvent.click(button);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: AUTH_ROUTES.signIn });
  });
});
