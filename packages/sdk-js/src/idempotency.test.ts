import { describe, expect, it } from "vitest";
import { idempotencyKey } from "./idempotency";

describe("idempotencyKey", () => {
  it("generates unique keys", () => {
    const a = idempotencyKey();
    const b = idempotencyKey();
    expect(a).toBeTruthy();
    expect(a).not.toBe(b);
  });

  it("is a reasonable length", () => {
    expect(idempotencyKey().length).toBeGreaterThan(8);
  });
});
