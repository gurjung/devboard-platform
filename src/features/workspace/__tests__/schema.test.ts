import { createWorkspaceSchema } from "../schema";

describe("Workspace schemas", () => {
  describe("createWorkspaceSchema", () => {
    it("should validate successfully with a valid name", () => {
      const result = createWorkspaceSchema.safeParse({
        name: "My Workspace",
      });
      expect(result.success).toBe(true);
    });

    it("should validate successfully with a valid name and logo URL", () => {
      const result = createWorkspaceSchema.safeParse({
        name: "My Workspace",
        logo: "https://example.com/logo.png",
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty or null logo", () => {
      const resultEmpty = createWorkspaceSchema.safeParse({
        name: "My Workspace",
        logo: "",
      });
      expect(resultEmpty.success).toBe(true);

      const resultNull = createWorkspaceSchema.safeParse({
        name: "My Workspace",
        logo: null,
      });
      expect(resultNull.success).toBe(true);
    });

    it("should reject name that is too short", () => {
      const result = createWorkspaceSchema.safeParse({
        name: "A",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Workspace name must be at least 2 characters",
        );
      }
    });

    it("should reject name that is too long", () => {
      const result = createWorkspaceSchema.safeParse({
        name: "A".repeat(51),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Workspace name must be 50 characters or less",
        );
      }
    });

    it("should reject invalid logo URL format", () => {
      const result = createWorkspaceSchema.safeParse({
        name: "My Workspace",
        logo: "invalid-url",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid logo URL");
      }
    });
  });
});
