import { describe, it, expect } from "vitest";
import { parseEventInput, splitBatch } from "./ingest";

describe("parseEventInput", () => {
  it("accepts a minimal valid event", () => {
    const r = parseEventInput({
      idempotency_key: "k1",
      provider: "openai",
      model: "gpt-4o",
      inputTokens: 1000,
      outputTokens: 500,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.event.idempotencyKey).toBe("k1");
      expect(r.event.provider).toBe("openai");
      expect(r.event.inputTokens).toBe(1000);
      expect(r.event.cachedInputTokens).toBe(0);
      expect(r.event.reasoningTokens).toBe(0);
      expect(r.event.timestamp).toBeInstanceOf(Date);
      expect(r.event.model).toBe("gpt-4o");
    }
  });

  it("requires idempotency_key", () => {
    const r = parseEventInput({ provider: "openai" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("idempotency_key");
  });

  it("requires provider", () => {
    const r = parseEventInput({ idempotency_key: "k" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("provider");
  });

  it("allows null model (unknown model → unpriced)", () => {
    const r = parseEventInput({ idempotency_key: "k", provider: "newco" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.event.model).toBeNull();
  });

  it("rejects negative or fractional token counts", () => {
    expect(parseEventInput({ idempotency_key: "k", provider: "p", inputTokens: -1 }).ok).toBe(false);
    expect(parseEventInput({ idempotency_key: "k", provider: "p", inputTokens: 1.5 }).ok).toBe(false);
  });

  it("rejects invalid timestamp", () => {
    const r = parseEventInput({ idempotency_key: "k", provider: "p", timestamp: "not-a-date" });
    expect(r.ok).toBe(false);
  });

  it("coerces a valid timestamp to a Date", () => {
    const r = parseEventInput({
      idempotency_key: "k",
      provider: "p",
      timestamp: "2026-03-15T12:00:00.000Z",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.event.timestamp.toISOString()).toBe("2026-03-15T12:00:00.000Z");
  });

  it("caps status length and defaults to ok", () => {
    const r = parseEventInput({ idempotency_key: "k", provider: "p", status: "x".repeat(50) });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.event.status.length).toBe(20);
  });

  it("rejects non-object bodies", () => {
    expect(parseEventInput("nope").ok).toBe(false);
    expect(parseEventInput(null).ok).toBe(false);
    expect(parseEventInput([1, 2]).ok).toBe(false);
  });
});

describe("splitBatch", () => {
  it("normalizes a single object to an array", () => {
    expect(splitBatch({ a: 1 })).toEqual([{ a: 1 }]);
  });
  it("passes arrays through", () => {
    expect(splitBatch([{ a: 1 }, { b: 2 }])).toEqual([{ a: 1 }, { b: 2 }]);
  });
});
