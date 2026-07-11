import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Minimum of 8 characters required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
