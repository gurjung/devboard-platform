import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import type { LoginInput } from "@/features/auth/schema";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      return result;
    },
  });
};
