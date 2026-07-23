import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Project name must be at least 2 characters" })
    .max(50, { message: "Project name must be 50 characters or less" }),
  logo: z
    .string()
    .url({ message: "Invalid logo URL" })
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
