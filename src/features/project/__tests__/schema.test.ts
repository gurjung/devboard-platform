import { createProjectSchema } from "../schema";

describe("Project validation schemas", () => {
  describe("createProjectSchema", () => {
    it("should validate successfully with valid name and optional logo URL", () => {
      const result = createProjectSchema.safeParse({
        name: "Acme Project",
        logo: "https://example.com/logo.png",
      });
      expect(result.success).toBe(true);
    });

    it("should validate successfully with valid name and empty logo", () => {
      const result = createProjectSchema.safeParse({
        name: "Acme Project",
        logo: "",
      });
      expect(result.success).toBe(true);
    });

    it("should validate successfully with valid name and null logo", () => {
      const result = createProjectSchema.safeParse({
        name: "Acme Project",
        logo: null,
      });
      expect(result.success).toBe(true);
    });

    it("should reject too short project names", () => {
      const result = createProjectSchema.safeParse({
        name: "A",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Project name must be at least 2 characters"
        );
      }
    });

    it("should reject too long project names", () => {
      const longName = "A".repeat(51);
      const result = createProjectSchema.safeParse({
        name: longName,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Project name must be 50 characters or less"
        );
      }
    });

    it("should reject invalid logo URL formats", () => {
      const result = createProjectSchema.safeParse({
        name: "Acme Project",
        logo: "not-a-valid-url",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid logo URL");
      }
    });
  });
});
