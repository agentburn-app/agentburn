/**
 * Pure validation/normalization for ingest payloads. Kept free of DB so it
 * is unit-testable; the route stays a thin adapter.
 */

export interface ParsedEvent {
  idempotencyKey: string;
  timestamp: Date;
  provider: string;
  model: string | null;
  environment: string | null;
  agentId: string | null;
  workflowId: string | null;
  taskId: string | null;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  reasoningTokens: number;
  latencyMs: number | null;
  status: string;
  source: string | null;
  customMetadata: unknown;
}

export type ParseResult =
  | { ok: true; event: ParsedEvent }
  | { ok: false; error: string };

type StrResult = { ok: true; value: string | null } | { ok: false; error: string };
type IntResult = { ok: true; value: number } | { ok: false; error: string };

const MAX_EVENTS = 1000;

function str(value: unknown, max: number, field: string): StrResult {
  if (value === undefined || value === null) return { ok: true, value: null };
  if (typeof value !== "string") return { ok: false, error: `${field} must be a string` };
  if (value.length === 0 || value.length > max) {
    return { ok: false, error: `${field} must be 1-${max} characters` };
  }
  return { ok: true, value };
}

function tokens(value: unknown, field: string): IntResult {
  if (value === undefined || value === null) return { ok: true, value: 0 };
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return { ok: false, error: `${field} must be a non-negative integer` };
  }
  return { ok: true, value };
}

export function parseEventInput(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "event must be an object" };
  }
  const b = body as Record<string, unknown>;

  const idem = str(b.idempotency_key, 255, "idempotency_key");
  if (!idem.ok) return { ok: false, error: idem.error };
  if (idem.value === null) return { ok: false, error: "idempotency_key is required" };

  const provider = str(b.provider, 100, "provider");
  if (!provider.ok) return { ok: false, error: provider.error };
  if (provider.value === null) return { ok: false, error: "provider is required" };

  const model = str(b.model, 100, "model");
  if (!model.ok) return { ok: false, error: model.error };

  const environment = str(b.environment, 50, "environment");
  if (!environment.ok) return { ok: false, error: environment.error };
  const agentId = str(b.agentId, 255, "agentId");
  if (!agentId.ok) return { ok: false, error: agentId.error };
  const workflowId = str(b.workflowId, 255, "workflowId");
  if (!workflowId.ok) return { ok: false, error: workflowId.error };
  const taskId = str(b.taskId, 255, "taskId");
  if (!taskId.ok) return { ok: false, error: taskId.error };
  const source = str(b.source, 50, "source");
  if (!source.ok) return { ok: false, error: source.error };

  const inputTokens = tokens(b.inputTokens, "inputTokens");
  if (!inputTokens.ok) return { ok: false, error: inputTokens.error };
  const outputTokens = tokens(b.outputTokens, "outputTokens");
  if (!outputTokens.ok) return { ok: false, error: outputTokens.error };
  const cachedInputTokens = tokens(b.cachedInputTokens, "cachedInputTokens");
  if (!cachedInputTokens.ok) return { ok: false, error: cachedInputTokens.error };
  const reasoningTokens = tokens(b.reasoningTokens, "reasoningTokens");
  if (!reasoningTokens.ok) return { ok: false, error: reasoningTokens.error };

  let latencyMs: number | null = null;
  if (b.latencyMs !== undefined && b.latencyMs !== null) {
    if (
      typeof b.latencyMs !== "number" ||
      b.latencyMs < 0 ||
      !Number.isInteger(b.latencyMs)
    ) {
      return { ok: false, error: "latencyMs must be a non-negative integer" };
    }
    latencyMs = b.latencyMs;
  }

  const status =
    typeof b.status === "string" && b.status !== "" ? b.status.slice(0, 20) : "ok";

  let timestamp = new Date();
  if (b.timestamp !== undefined && b.timestamp !== null) {
    const parsed = new Date(b.timestamp as string);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "timestamp must be a valid date" };
    }
    timestamp = parsed;
  }

  return {
    ok: true,
    event: {
      idempotencyKey: idem.value,
      timestamp,
      provider: provider.value,
      model: model.value,
      environment: environment.value,
      agentId: agentId.value,
      workflowId: workflowId.value,
      taskId: taskId.value,
      inputTokens: inputTokens.value,
      outputTokens: outputTokens.value,
      cachedInputTokens: cachedInputTokens.value,
      reasoningTokens: reasoningTokens.value,
      latencyMs,
      status,
      source: source.value,
      customMetadata: b.customMetadata ?? null,
    },
  };
}

export function splitBatch(body: unknown): unknown[] {
  return Array.isArray(body) ? (body as unknown[]) : [body];
}

export const MAX_BATCH = MAX_EVENTS;
