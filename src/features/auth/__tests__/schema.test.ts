import { loginSchema, registerSchema } from "../schema";

describe("Auth validation schemas", () => {
  describe("loginSchema", () => {
    it("should validate successfully with valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email formats", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address");
      }
    });

    it("should reject empty passwords", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Required");
      }
    });
  });

  describe("registerSchema", () => {
    it("should validate successfully with valid fields", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "securepassword123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const result = registerSchema.safeParse({
        name: "",
        email: "john@example.com",
        password: "securepassword123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Name is required");
      }
    });

    it("should reject invalid email formats", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "invalid-email",
        password: "securepassword123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address");
      }
    });

    it("should reject password less than 8 characters", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Minimum of 8 characters required"
        );
      }
    });
  });
});
