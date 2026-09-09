# agentburn/sdk (PHP)

The AgentBurn PHP SDK. Send usage events and read back itemized,
explainable costs. Requires PHP 8.1+.

```bash
composer require agentburn/sdk
```

## Usage

```php
use AgentBurn\AgentBurn;

$agentburn = new AgentBurn(apiKey: getenv('AGENTBURN_KEY'));

$result = $agentburn->track([
    'provider' => 'openai',
    'model' => 'gpt-4o',
    'inputTokens' => 1_200_000,
    'outputTokens' => 42_000,
]);

// ['accepted' => true, 'pricingStatus' => 'priced', 'cost' => 3.42,
//  'explanation' => 'OpenAI → gpt-4o → version …: 1.2M input × $2.50 + …']
```

Batch:

```php
$results = $agentburn->trackBatch([
    ['provider' => 'openai', 'model' => 'gpt-4o', 'inputTokens' => 1000, 'outputTokens' => 200],
    ['provider' => 'anthropic', 'model' => 'claude-sonnet-4', 'inputTokens' => 500, 'outputTokens' => 100],
]);
```

## Idempotency

Every event carries an `idempotency_key`. Omit it and the SDK generates one;
pass your own to make retries safe:

```php
use AgentBurn\Idempotency;

$key = Idempotency::key();
$agentburn->track(['provider' => 'openai', 'model' => 'gpt-4o', 'idempotencyKey' => $key]);
// retry the same logical operation safely:
$agentburn->track(['provider' => 'openai', 'model' => 'gpt-4o', 'idempotencyKey' => $key]);
```

## Configuration

| Argument | Default | Notes |
|---|---|---|
| `apiKey` | — | Required. Project API key from the dashboard. |
| `baseUrl` | `https://agentburn.dev` | Point at a self-hosted instance. |
| `retries` | `3` | Retries network errors and 429/5xx with backoff. |
| `http` | `CurlHttpClient` | Inject a transport for testing / custom TLS. |

## Behavior

- Cost is **server-computed** — you never send a price.
- Unknown models are accepted (`pricingStatus: "unpriced"`), never rejected.
- Client errors throw `AgentBurnException`; rate limits and server errors retry.
- No prompts or completions are ever sent — only metadata and token counts.

See the [event spec](../../docs/events.md) for the full field reference.
