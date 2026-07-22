"use client";

import React from "react";
import { en } from "@/locales/en";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface SocialAuthButtonsProps {
  disabled?: boolean;
  action?: "login" | "signup";
}

export function SocialAuthButtons({
  disabled = false,
  action = "login",
}: SocialAuthButtonsProps) {
  const googleText = action === "login" ? en.auth.socialAuth.loginGoogle : en.auth.socialAuth.signupGoogle;
  const githubText = action === "login" ? en.auth.socialAuth.loginGithub : en.auth.socialAuth.signupGithub;

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="w-full cursor-pointer"
        disabled={disabled}
      >
        <FcGoogle />
        {googleText}
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="w-full cursor-pointer"
        disabled={disabled}
      >
        <FaGithub />
        {githubText}
      </Button>
    </>
  );
}
