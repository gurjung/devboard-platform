import React from "react";
import { render, screen } from "@testing-library/react";
import { SocialAuthButtons } from "../social-auth-buttons";
import { en } from "@/locales/en";

describe("SocialAuthButtons component", () => {
  it("renders buttons with login action text by default", () => {
    render(<SocialAuthButtons action="login" />);

    const googleBtn = screen.getByRole("button", {
      name: new RegExp(en.auth.socialAuth.loginGoogle, "i"),
    });
    const githubBtn = screen.getByRole("button", {
      name: new RegExp(en.auth.socialAuth.loginGithub, "i"),
    });

    expect(googleBtn).toBeInTheDocument();
    expect(githubBtn).toBeInTheDocument();
  });

  it("renders buttons with signup action text", () => {
    render(<SocialAuthButtons action="signup" />);

    const googleBtn = screen.getByRole("button", {
      name: new RegExp(en.auth.socialAuth.signupGoogle, "i"),
    });
    const githubBtn = screen.getByRole("button", {
      name: new RegExp(en.auth.socialAuth.signupGithub, "i"),
    });

    expect(googleBtn).toBeInTheDocument();
    expect(githubBtn).toBeInTheDocument();
  });

  it("disables both buttons when disabled is true", () => {
    render(<SocialAuthButtons disabled action="login" />);

    const googleBtn = screen.getByRole("button", {
      name: new RegExp(en.auth.socialAuth.loginGoogle, "i"),
    });
    const githubBtn = screen.getByRole("button", {
      name: new RegExp(en.auth.socialAuth.loginGithub, "i"),
    });

    expect(googleBtn).toBeDisabled();
    expect(githubBtn).toBeDisabled();
  });
});
