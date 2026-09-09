/**
 * Generate an idempotency key. Uses crypto.randomUUID where available
 * (browsers, Node 19+), with a fallback for older runtimes.
 */
export function idempotencyKey(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (typeof g.crypto?.randomUUID === "function") {
    return g.crypto.randomUUID();
  }
  return `ab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
