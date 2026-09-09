# agentburn (Python)

The AgentBurn Python SDK. Send usage events and read back itemized,
explainable costs. Python 3.8+, no third-party dependencies (stdlib only).

```bash
pip install agentburn
```

## Usage

```python
from agentburn import AgentBurn

agentburn = AgentBurn(api_key="YOUR_KEY")

result = agentburn.track({
    "provider": "openai",
    "model": "gpt-4o",
    "inputTokens": 1_200_000,
    "outputTokens": 42_000,
})

# {"accepted": True, "pricingStatus": "priced", "cost": 3.42,
#  "explanation": "OpenAI → gpt-4o → version …: 1.2M input × $2.50 + …"}
```

Batch:

```python
results = agentburn.track_batch([
    {"provider": "openai", "model": "gpt-4o", "inputTokens": 1000, "outputTokens": 200},
    {"provider": "anthropic", "model": "claude-sonnet-4", "inputTokens": 500, "outputTokens": 100},
])
```

## Idempotency

Every event carries an `idempotency_key`. Omit it and the SDK generates one;
pass your own to make retries safe:

```python
from agentburn import idempotency_key

key = idempotency_key()
agentburn.track({"provider": "openai", "model": "gpt-4o", "idempotencyKey": key})
agentburn.track({"provider": "openai", "model": "gpt-4o", "idempotencyKey": key})  # safe retry
```

## Configuration

| Argument | Default | Notes |
|---|---|---|
| `api_key` | — | Required. Project API key from the dashboard. |
| `base_url` | `https://agentburn.dev` | Point at a self-hosted instance. |
| `retries` | `3` | Retries network errors and 429/5xx with backoff. |
| `timeout` | `10.0` | Per-request timeout (seconds). |
| `http` | `UrllibHttpClient` | Inject a transport for testing. |

## Behavior

- Cost is **server-computed** — you never send a price.
- Unknown models are accepted (`pricingStatus: "unpriced"`), never rejected.
- Client errors raise `AgentBurnError`; rate limits and server errors retry.
- No prompts or completions are ever sent — only metadata and token counts.

See the [event spec](../../docs/events.md) for the full field reference.
