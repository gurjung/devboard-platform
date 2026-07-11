import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
