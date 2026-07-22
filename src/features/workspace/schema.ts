import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Workspace name must be at least 2 characters" })
    .max(50, { message: "Workspace name must be 50 characters or less" }),
  logo: z
    .string()
    .url({ message: "Invalid logo URL" })
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  role: z.enum(["ADMIN", "MEMBER"], {
    message: "Please select a role",
  }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

