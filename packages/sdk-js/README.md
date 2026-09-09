# @agentburn/sdk

The AgentBurn JavaScript/TypeScript SDK. Send usage events and read back
itemized, explainable costs.

```bash
npm install @agentburn/sdk
```

## Usage

```ts
import { AgentBurn } from "@agentburn/sdk";

const agentburn = new AgentBurn({ apiKey: process.env.AGENTBURN_KEY });

const result = await agentburn.track({
  provider: "openai",
  model: "gpt-4o",
  inputTokens: 1_200_000,
  outputTokens: 42_000,
});

console.log(result);
// {
//   accepted: true,
//   pricingStatus: "priced",
//   cost: 3.42,
//   explanation: "OpenAI → gpt-4o → version …: 1.2M input × $2.50 + 42K output × $10.00 = $3.42"
// }
```

Batch:

```ts
const results = await agentburn.trackBatch([
  { provider: "openai", model: "gpt-4o", inputTokens: 1000, outputTokens: 200 },
  { provider: "anthropic", model: "claude-sonnet-4", inputTokens: 500, outputTokens: 100 },
]);
```

## Idempotency

Every event carries an `idempotency_key`. Omit it and the SDK generates one —
but for retry-safe code, pass your own so a retried operation returns the
original result instead of double-counting:

```ts
import { idempotencyKey } from "@agentburn/sdk";

const key = idempotencyKey();
await agentburn.track({ provider: "openai", model: "gpt-4o", idempotencyKey: key });
// …retry the same logical operation…
await agentburn.track({ provider: "openai", model: "gpt-4o", idempotencyKey: key });
```

## Configuration

| Option | Default | Notes |
|---|---|---|
| `apiKey` | — | Required. Project API key from the dashboard. |
| `baseUrl` | `https://agentburn.dev` | Point at a self-hosted instance. |
| `retries` | `3` | Retries network errors and 429/5xx with backoff. |
| `timeoutMs` | `10_000` | Per-request timeout. |

## Behavior

- Cost is **server-computed** — you never send a price.
- Unknown models are accepted (`pricingStatus: "unpriced"`), never rejected.
- Client errors (401/400) throw `AgentBurnError` immediately; rate limits and
  server errors are retried.
- No prompts or completions are ever sent — only metadata and token counts.

See the [event spec](../../docs/events.md) for the full field reference.
