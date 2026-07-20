import { describe, it, expect } from "vitest";
import { taskInputSchema } from "../lib/validation";

describe("taskInputSchema", () => {
  it("accepts valid input with title and payload", () => {
    const result = taskInputSchema.safeParse({
      title: "Test task",
      payload: "Some data",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Test task");
      expect(result.data.payload).toBe("Some data");
    }
  });

  it("accepts input with title only, defaults payload to empty string", () => {
    const result = taskInputSchema.safeParse({ title: "Title only" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.payload).toBe("");
    }
  });

  it("rejects empty title", () => {
    const result = taskInputSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing title", () => {
    const result = taskInputSchema.safeParse({ payload: "data" });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 200 characters", () => {
    const result = taskInputSchema.safeParse({ title: "x".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects payload longer than 1000 characters", () => {
    const result = taskInputSchema.safeParse({
      title: "Valid",
      payload: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-object input", () => {
    expect(taskInputSchema.safeParse(null).success).toBe(false);
    expect(taskInputSchema.safeParse("string").success).toBe(false);
    expect(taskInputSchema.safeParse(42).success).toBe(false);
  });
});
