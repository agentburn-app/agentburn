/**
 * Deterministic pricing core. All money arithmetic lives here so a future
 * Float→Decimal migration is a single-file change. Money is represented as
 * plain JS numbers for v1 (codebase convention); the reproducibility
 * contract is satisfied by storing integer token counts, exact rates, and
 * the pricing-version reference — not by floating-point magic.
 */

export type TokenCategory =
  | "input"
  | "output"
  | "cached_input"
  | "reasoning";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  reasoningTokens: number;
}

export interface PriceRates {
  inputPrice: number;
  outputPrice: number;
  cachedInputPrice?: number | null;
  reasoningPrice?: number | null;
}

export interface CostLine {
  category: TokenCategory;
  quantity: number; // tokens
  rate: number; // per 1M tokens
  subtotal: number;
}

export interface Provenance {
  provider: string;
  model: string;
  pricingVersionId?: string;
  effectiveFrom?: string;
  sourceUrl?: string;
  verifiedAt?: string;
  currency?: string;
}

export interface CostBreakdown {
  total: number;
  lines: CostLine[];
  provenance: Provenance;
}

const TOKENS_PER_UNIT = 1_000_000;

/**
 * Compute the fully-itemized cost for a usage payload against a set of
 * per-1M-token rates. Deterministic: same inputs → identical output.
 */
export function computeCost(
  usage: TokenUsage,
  rates: PriceRates,
  provenance: Provenance
): CostBreakdown {
  const lines: CostLine[] = [];
  const push = (category: TokenCategory, quantity: number, rate: number | null | undefined) => {
    if (quantity <= 0) return;
    if (rate == null || rate <= 0) return; // no price configured for this category
    lines.push({
      category,
      quantity,
      rate,
      subtotal: roundMoney((quantity / TOKENS_PER_UNIT) * rate),
    });
  };

  push("input", usage.inputTokens, rates.inputPrice);
  push("output", usage.outputTokens, rates.outputPrice);
  push("cached_input", usage.cachedInputTokens, rates.cachedInputPrice);
  push("reasoning", usage.reasoningTokens, rates.reasoningPrice);

  const total = roundMoney(lines.reduce((sum, l) => sum + l.subtotal, 0));
  return { total, lines, provenance };
}

/** Round to sub-cent precision without floating drift. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

export interface PricedVersion {
  id: string;
  inputPrice: number;
  outputPrice: number;
  cachedInputPrice: number | null;
  reasoningPrice: number | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  verificationStatus: string;
  sourceUrl: string;
  verifiedAt: Date | null;
}

/**
 * Resolve the version in effect at `at`, preferring verified versions.
 * Returns null when no version covers the timestamp. A null effectiveTo is
 * an open-ended version.
 */
export function resolveVersionAt(
  versions: PricedVersion[],
  at: Date
): PricedVersion | null {
  const inWindow = versions.filter((v) => {
    const from = v.effectiveFrom.getTime();
    const to = v.effectiveTo ? v.effectiveTo.getTime() : Infinity;
    return at.getTime() >= from && at.getTime() < to;
  });
  if (inWindow.length === 0) return null;
  // Prefer verified; among equals, latest effectiveFrom.
  inWindow.sort((a, b) => {
    const va = a.verificationStatus === "verified" ? 1 : 0;
    const vb = b.verificationStatus === "verified" ? 1 : 0;
    if (va !== vb) return vb - va;
    return b.effectiveFrom.getTime() - a.effectiveFrom.getTime();
  });
  return inWindow[0];
}

/**
 * Produce the "$4.72, here's why" string required by the explainability
 * contract. Never fabricates — only renders lines that actually exist.
 */
export function explainCost(b: CostBreakdown): string {
  const { provider, model, pricingVersionId, sourceUrl, verifiedAt } = b.provenance;
  const fmtMoney = (n: number) => `$${n.toFixed(2)}`;
  const fmtTokens = (n: number) => {
    if (n >= TOKENS_PER_UNIT) {
      const m = n / TOKENS_PER_UNIT;
      return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
    }
    if (n >= 1000 && n % 1000 === 0) {
      return `${n / 1000}K`;
    }
    return `${n}`;
  };

  const parts = b.lines.map(
    (l) => `${fmtTokens(l.quantity)} ${l.category} × ${fmtMoney(l.rate)}`
  );
  const arithmetic = parts.length > 0 ? parts.join(" + ") : "no priced categories";

  let head = `${provider} → ${model}`;
  if (pricingVersionId) head += ` → version ${pricingVersionId}`;
  if (verifiedAt) head += ` (source verified ${verifiedAt})`;
  if (sourceUrl) head += ` — ${sourceUrl}`;

  return `${head}: ${arithmetic} = ${fmtMoney(b.total)}`;
}

/** Launch gate: all launch models must have verified current pricing. */
export function allVerified(models: { currentPricing: { version: { verificationStatus: string } } | null }[]): boolean {
  return models.every((m) => m.currentPricing?.version.verificationStatus === "verified");
}
