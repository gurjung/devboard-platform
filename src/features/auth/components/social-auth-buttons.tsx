"use client";

import React from "react";
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
  const googleText = action === "login" ? "Login with Google" : "Sign up with Google";
  const githubText = action === "login" ? "Login with GitHub" : "Sign up with GitHub";

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
