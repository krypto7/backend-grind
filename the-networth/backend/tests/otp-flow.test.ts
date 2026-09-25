import { describe, it, expect } from "node:test";
import {
  normalizeEmail,
  normalizeOTP,
} from "../src/controllers/auth.controller.ts";

describe("OTP helpers", () => {
  it("normalizes email and OTP values before validation", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
    expect(normalizeOTP(" 123456 ")).toBe("123456");
  });
});
