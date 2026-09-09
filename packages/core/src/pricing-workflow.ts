/**
 * Pricing verification workflow (pure helpers). Automated discovery NEVER
 * mutates production pricing: a submitted change becomes a pending
 * PricingChange that a human approves into a verified PricingVersion.
 * Scraping/collectors are out of scope here — providers submit normalized
 * proposals via the API (manual or a future collector behind the same
 * endpoint). No prices are fabricated anywhere.
 */

export interface NormalizedProposal {
  provider: string;
  model: string;
  inputPrice: number;
  outputPrice: number;
  cachedInputPrice: number | null;
  reasoningPrice: number | null;
  imagePrice: number | null;
  audioPrice: number | null;
  currency: string;
  unit: string;
  sourceUrl: string | null;
  sourceType: string;
  detectedBy: string;
}

export type ProposalResult =
  | { ok: true; proposal: NormalizedProposal }
  | { ok: false; error: string };

type NumResult = { ok: true; value: number } | { ok: false; error: string };
type OptNumResult = { ok: true; value: number | null } | { ok: false; error: string };
type StrResult = { ok: true; value: string } | { ok: false; error: string };
type OptStrResult = { ok: true; value: string | null } | { ok: false; error: string };

function reqNumber(value: unknown, field: string): NumResult {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return { ok: false, error: `${field} must be a positive number` };
  }
  return { ok: true, value };
}

function optNumber(value: unknown, field: string): OptNumResult {
  if (value === undefined || value === null) return { ok: true, value: null };
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return { ok: false, error: `${field} must be a non-negative number or null` };
  }
  return { ok: true, value };
}

function reqString(value: unknown, max: number, field: string): StrResult {
  if (typeof value !== "string" || value.trim() === "" || value.length > max) {
    return { ok: false, error: `${field} is required (1-${max} characters)` };
  }
  return { ok: true, value: value.trim() };
}

function optString(value: unknown, max: number): OptStrResult {
  if (value === undefined || value === null) return { ok: true, value: null };
  if (typeof value !== "string" || value.length > max) {
    return { ok: false, error: `optional field must be a string <= ${max} characters` };
  }
  return { ok: true, value };
}

export function validateProposal(input: unknown): ProposalResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, error: "proposal must be an object" };
  }
  const b = input as Record<string, unknown>;

  const provider = reqString(b.provider, 100, "provider");
  if (!provider.ok) return { ok: false, error: provider.error };
  const model = reqString(b.model, 255, "model");
  if (!model.ok) return { ok: false, error: model.error };

  const inputPrice = reqNumber(b.inputPrice, "inputPrice");
  if (!inputPrice.ok) return { ok: false, error: inputPrice.error };
  const outputPrice = reqNumber(b.outputPrice, "outputPrice");
  if (!outputPrice.ok) return { ok: false, error: outputPrice.error };

  const cachedInputPrice = optNumber(b.cachedInputPrice, "cachedInputPrice");
  if (!cachedInputPrice.ok) return { ok: false, error: cachedInputPrice.error };
  const reasoningPrice = optNumber(b.reasoningPrice, "reasoningPrice");
  if (!reasoningPrice.ok) return { ok: false, error: reasoningPrice.error };
  const imagePrice = optNumber(b.imagePrice, "imagePrice");
  if (!imagePrice.ok) return { ok: false, error: imagePrice.error };
  const audioPrice = optNumber(b.audioPrice, "audioPrice");
  if (!audioPrice.ok) return { ok: false, error: audioPrice.error };

  const sourceUrl = optString(b.sourceUrl, 500);
  if (!sourceUrl.ok) return { ok: false, error: sourceUrl.error };
  const detectedBy = optString(b.detectedBy, 100);
  if (!detectedBy.ok) return { ok: false, error: detectedBy.error };

  return {
    ok: true,
    proposal: {
      provider: provider.value,
      model: model.value,
      inputPrice: inputPrice.value,
      outputPrice: outputPrice.value,
      cachedInputPrice: cachedInputPrice.value,
      reasoningPrice: reasoningPrice.value,
      imagePrice: imagePrice.value,
      audioPrice: audioPrice.value,
      currency: typeof b.currency === "string" && b.currency ? b.currency.slice(0, 10) : "USD",
      unit: typeof b.unit === "string" && b.unit ? b.unit.slice(0, 50) : "1M tokens",
      sourceUrl: sourceUrl.value,
      sourceType:
        typeof b.sourceType === "string" && b.sourceType ? b.sourceType.slice(0, 20) : "manual",
      detectedBy: detectedBy.value ?? "manual",
    },
  };
}

export interface CurrentRates {
  inputPrice: number;
  outputPrice: number;
  cachedInputPrice: number | null;
  reasoningPrice: number | null;
}

function fmtRate(n: number | null): string {
  if (n === null || n === undefined) return "—";
  return `$${n.toFixed(4)}`;
}

/** Human-readable change summary for the review queue. */
export function diffSummary(current: CurrentRates | null, proposed: NormalizedProposal): string {
  if (!current) return "initial pricing";

  const parts: string[] = [];
  const compare = (
    label: string,
    oldVal: number | null,
    newVal: number | null
  ) => {
    const oldF = fmtRate(oldVal);
    const newF = fmtRate(newVal);
    if (oldF !== newF) parts.push(`${label} ${oldF}→${newF}`);
  };

  compare("input", current.inputPrice, proposed.inputPrice);
  compare("output", current.outputPrice, proposed.outputPrice);
  compare("cached_input", current.cachedInputPrice, proposed.cachedInputPrice);
  compare("reasoning", current.reasoningPrice, proposed.reasoningPrice);

  return parts.length > 0 ? parts.join(", ") : "no change";
}
