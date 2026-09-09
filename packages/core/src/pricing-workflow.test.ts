import { describe, it, expect } from "vitest";
import { diffSummary, validateProposal } from "./pricing-workflow";

describe("validateProposal", () => {
  it("accepts a minimal valid proposal", () => {
    const r = validateProposal({
      provider: "openai",
      model: "gpt-4o",
      inputPrice: 2.5,
      outputPrice: 10,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.proposal.cachedInputPrice).toBeNull();
      expect(r.proposal.reasoningPrice).toBeNull();
      expect(r.proposal.currency).toBe("USD");
      expect(r.proposal.unit).toBe("1M tokens");
      expect(r.proposal.detectedBy).toBe("manual");
    }
  });

  it("requires provider and model", () => {
    expect(validateProposal({ model: "x", inputPrice: 1, outputPrice: 1 }).ok).toBe(false);
    expect(validateProposal({ provider: "x", inputPrice: 1, outputPrice: 1 }).ok).toBe(false);
  });

  it("requires positive input/output prices", () => {
    expect(validateProposal({ provider: "p", model: "m", inputPrice: 0, outputPrice: 1 }).ok).toBe(false);
    expect(validateProposal({ provider: "p", model: "m", inputPrice: -1, outputPrice: 1 }).ok).toBe(false);
    expect(validateProposal({ provider: "p", model: "m", inputPrice: 1 }).ok).toBe(false);
  });

  it("accepts optional non-negative category prices", () => {
    const r = validateProposal({
      provider: "p",
      model: "m",
      inputPrice: 1,
      outputPrice: 1,
      cachedInputPrice: 0.25,
      reasoningPrice: 0,
    });
    expect(r.ok).toBe(true);
    expect(validateProposal({ provider: "p", model: "m", inputPrice: 1, outputPrice: 1, cachedInputPrice: -1 }).ok).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(validateProposal(null).ok).toBe(false);
    expect(validateProposal([]).ok).toBe(false);
    expect(validateProposal("x").ok).toBe(false);
  });
});

describe("diffSummary", () => {
  const current = {
    inputPrice: 2.5,
    outputPrice: 10,
    cachedInputPrice: 0.625,
    reasoningPrice: 1.25,
  };

  it("reports initial pricing when no current version", () => {
    expect(diffSummary(null, { inputPrice: 2.5, outputPrice: 10 } as never)).toBe("initial pricing");
  });

  it("lists changed fields old→new", () => {
    const s = diffSummary(current, {
      inputPrice: 3.0,
      outputPrice: 10,
      cachedInputPrice: 0.625,
      reasoningPrice: 1.25,
    } as never);
    expect(s).toContain("input $2.5000→$3.0000");
    expect(s).not.toContain("output");
  });

  it("reports no change when identical", () => {
    const s = diffSummary(current, {
      inputPrice: 2.5,
      outputPrice: 10,
      cachedInputPrice: 0.625,
      reasoningPrice: 1.25,
    } as never);
    expect(s).toBe("no change");
  });
});
