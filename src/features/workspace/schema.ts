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
