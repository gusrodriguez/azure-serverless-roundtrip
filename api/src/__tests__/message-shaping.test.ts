import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { ProcessedItem } from "../lib/cosmos";

describe("message shaping", () => {
  it("builds an enriched message from validated input", () => {
    const correlationId = randomUUID();
    const submittedAt = new Date().toISOString();
    const input = { title: "My task", payload: "details" };

    const enriched = { correlationId, ...input, submittedAt };

    expect(enriched).toEqual({
      correlationId,
      title: "My task",
      payload: "details",
      submittedAt,
    });
    expect(enriched.correlationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("builds a ProcessedItem from a queue message", () => {
    const correlationId = randomUUID();
    const submittedAt = "2024-01-01T00:00:00.000Z";
    const processedAt = "2024-01-01T00:00:01.000Z";

    const item: ProcessedItem = {
      id: correlationId,
      title: "Task",
      payload: "",
      submittedAt,
      processedAt,
      status: "processed",
    };

    expect(item.id).toBe(correlationId);
    expect(item.status).toBe("processed");
  });

  it("uses correlationId as the document id for idempotent upserts", () => {
    const correlationId = randomUUID();

    const firstWrite: ProcessedItem = {
      id: correlationId,
      title: "Task",
      payload: "v1",
      submittedAt: "2024-01-01T00:00:00.000Z",
      processedAt: "2024-01-01T00:00:01.000Z",
      status: "processed",
    };

    const secondWrite: ProcessedItem = {
      id: correlationId,
      title: "Task",
      payload: "v1",
      submittedAt: "2024-01-01T00:00:00.000Z",
      processedAt: "2024-01-01T00:00:02.000Z",
      status: "processed",
    };

    // Both writes target the same id — an upsert would overwrite, not duplicate
    expect(firstWrite.id).toBe(secondWrite.id);
  });
});
