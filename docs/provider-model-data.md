# Provider model data APIs

Research date: 2026-09-21

## Scope

Crow currently builds `models.json` from three configured sources: Nous, Ollama,
and OpenRouter. This document compares their model-catalog APIs and identifies
how Crow can determine whether a model supports reasoning and which reasoning
controls it exposes.

`reasoning: null` should mean **unknown**, not false. A model-list response that
omits capability metadata is not evidence that the model cannot reason.

## Summary

| Provider   | Catalog request                                        | Catalog shape                                                    | Best reasoning signal                                          | Extra requests |
| ---------- | ------------------------------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------- | -------------: |
| Nous       | `GET https://inference-api.nousresearch.com/v1/models` | OpenAI-style `{ "data": [...] }`, extended with gateway metadata | Per-model `reasoning` object; otherwise `supported_parameters` |              0 |
| Ollama     | `GET /api/tags`                                        | `{ "models": [...] }` with local artifact metadata               | `POST /api/show` per model, plus documented thinking behavior  |  one per model |
| OpenRouter | `GET https://openrouter.ai/api/v1/models`              | `{ "data": [...] }` with rich gateway metadata                   | Per-model `reasoning` object                                   |              0 |

## 1. Nous

### Catalog format

Crow requests `GET /v1/models` from the configured Nous base URL. The response
contract consumed by Crow is:

```json
{
  "data": [
    {
      "id": "provider/model-id",
      "name": "Display name",
      "context_length": 131072,
      "knowledge_cutoff": "2025-01-01",
      "pricing": {
        "prompt": "0.000001",
        "completion": "0.000003"
      },
      "architecture": {
        "modality": "text->text"
      },
      "reasoning": {
        "mandatory": false,
        "default_enabled": true,
        "default_effort": "medium"
      },
      "supported_parameters": [
        "reasoning",
        "include_reasoning",
        "reasoning_effort"
      ]
    }
  ]
}
```

Prices are strings representing dollars per token; Crow multiplies them by one
million. `architecture.modality` distinguishes text, embedding, and other
routes. Unlike OpenRouter's current public schema, the Nous type consumed by
Crow also includes `knowledge_cutoff`.

This is an observed/Crow-consumed contract rather than a documented public Nous
schema. Public Nous documentation describes the Portal as an OpenAI-compatible,
per-model router, but does not currently publish a field-by-field schema for
this model-list response. The fields should therefore be treated as subject to
change and validated against representative live responses.

### Reasoning detection

Use these signals in order:

1. A non-null `reasoning` object means `reasoning: true`.
2. If `reasoning` is absent but `supported_parameters` contains a reasoning
   control, reasoning is supported but the model's exact behavior is not fully
   described. Crow currently records this as `null`; it should instead be safe
   to record `true` once the provider contract is accepted as authoritative.
3. A present `supported_parameters` array with no reasoning control means
   `false`.
4. Missing both fields means `null`.
5. An embedding modality means `false`.

Reasoning options can be derived as follows:

| Provider metadata                              | Crow option     | Meaning                                     |
| ---------------------------------------------- | --------------- | ------------------------------------------- |
| `reasoning`                                    | `toggle`        | Send a normalized reasoning configuration   |
| `include_reasoning`                            | `toggle`        | Request or suppress returned reasoning text |
| `reasoning_effort`                             | `effort`        | Select an effort level                      |
| `reasoning.supported_efforts` if added         | `effort`        | Use only the advertised values              |
| `reasoning.supports_max_tokens: true` if added | `budget_tokens` | Set a reasoning token budget                |

The current Crow `ReasoningMeta` type only retains `mandatory`,
`default_enabled`, and `default_effort`; it does not retain supported effort
values or token-budget support.

## 2. Ollama

Ollama calls the provider-neutral reasoning capability **thinking**. A model
whose `capabilities` array contains `thinking` provides the equivalent of Crow's
`reasoning: true`; this is a terminology mapping, not a different model
capability. Ollama's native `think` request field controls that capability,
while its OpenAI-compatible API exposes the same control as `reasoning_effort`
or `reasoning.effort`.

### Catalog format

Crow requests `GET /api/tags`. Ollama documents this response as:

```json
{
  "models": [
    {
      "name": "qwen3:8b",
      "model": "qwen3:8b",
      "modified_at": "2025-10-03T23:34:03Z",
      "size": 5220000000,
      "digest": "sha256...",
      "details": {
        "format": "gguf",
        "family": "qwen3",
        "families": ["qwen3"],
        "parameter_size": "8B",
        "quantization_level": "Q4_K_M"
      }
    }
  ]
}
```

The documented `/api/tags` schema is inventory-oriented and omits context
length, reasoning support, prices, and reasoning controls. The live Crow Ollama
server extends it with `details.context_length`, `details.embedding_length`, and
a top-level `capabilities` array per model. Crow reads the context extension but
currently ignores `capabilities`, sets local prices to zero, and always emits
`reasoning: null` with no options.

### Other API for model details

For each installed model, call:

```http
POST /api/show
Content-Type: application/json

{ "model": "qwen3:8b" }
```

The response includes `capabilities`, `details`, textual `parameters`, and a
model-specific `model_info` map. Context length is normally available under an
architecture-specific key such as `<architecture>.context_length`; it is not a
stable top-level field.

Ollama's public `ShowResponse` schema describes `capabilities` only as a string
array and does not enumerate a guaranteed reasoning value. The three live
`POST /api/show` responses returned:

| Model                  | `capabilities`                              | Reasoning-related parameters |
| ---------------------- | ------------------------------------------- | ---------------------------- |
| `qwen3-coder:30b`      | `completion`, `tools`                       | none                         |
| `laguna-xs-2.1:latest` | `completion`, `tools`, `thinking`           | none                         |
| `gemma4:26b`           | `completion`, `vision`, `tools`, `thinking` | none                         |

These responses establish reasoning support for Laguna and Gemma through the
explicit `thinking` capability. They do not advertise whether thinking can be
disabled or which effort values each model accepts. The Qwen response has no
positive reasoning signal; because the schema does not state that `capabilities`
is exhaustive, classify it as unknown rather than false.

### Reasoning controls

Ollama's native `/api/chat` and `/api/generate` endpoints use `think`. To turn
reasoning off, send `false`; to enable the model default, send `true`; to
request an effort level, send a string:

```json
{
  "model": "gemma4:26b",
  "messages": [{ "role": "user", "content": "Solve this problem" }],
  "think": "low",
  "stream": false
}
```

The [`think` request schema](https://docs.ollama.com/api/chat) accepts a boolean
or `low`, `medium`, `high`, and `max`. Ollama's
[thinking guide](https://docs.ollama.com/capabilities/thinking) adds the runtime
semantics:

- most thinking models use `true`/`false` as the toggle and may accept the named
  levels;
- GPT-OSS requires `low`, `medium`, or `high`, ignores booleans, and cannot
  fully disable thinking;
- omission enables thinking by default for a thinking-capable model.

These are request-contract facts, not model-catalog metadata. Neither
`/api/tags` nor `/api/show` advertises the accepted `think` values for an
individual model.

Live requests verified both installed thinking models with `false`, `true`,
`"low"`, `"medium"`, `"high"`, and `"max"`:

| Model                  | `false`  | `true` | `low` | `medium` | `high` | `max` |
| ---------------------- | -------- | ------ | ----- | -------- | ------ | ----- |
| `laguna-xs-2.1:latest` | no trace | trace  | trace | trace    | trace  | trace |
| `gemma4:26b`           | no trace | trace  | trace | trace    | trace  | trace |

All twelve requests returned HTTP 200. These calls prove that both models
support a toggle and accept every effort value documented for the native API.
The short arithmetic prompt does not prove that the four named levels produce
meaningfully different reasoning intensity; that requires a harder controlled
prompt and comparison of reasoning-token counts or trace length. With
`num_predict: 128`, Laguna sometimes used the entire output allowance for its
reasoning trace and returned empty visible content; output limits must budget
for reasoning and the final answer together.

Ollama's OpenAI-compatible `/v1/chat/completions` endpoint exposes the same
control as either `reasoning_effort` or `reasoning.effort`, using `high`,
`medium`, `low`, or `none`. Ollama maps those fields internally to native
`think`; `none` corresponds to `think: false`.

### API logic consequence

A reliable cataloging strategy is:

1. Fetch `/api/tags` and read its live `capabilities` extension.
2. Set `reasoning: true` when `capabilities` contains `thinking`.
3. Keep `reasoning: null` when the explicit capability is absent.
4. Use `/api/show` only as a fallback when `/api/tags` omits capabilities.
5. Do not infer support solely from names such as `qwen3` or `deepseek-r1`.

For the two installed thinking models, live calls establish
`reasoningOptions: ["toggle", "effort"]` and effort values `low`, `medium`,
`high`, and `max`. That mapping cannot be generalized from
`capabilities:
["thinking"]` alone because Ollama does not return per-model
control metadata and GPT-OSS has different semantics. Generic ingestion can
safely discover reasoning support; exact controls require a provider rule, an
allowlist, or capability probes cached by model digest.

## 3. OpenRouter

### Catalog format

OpenRouter's public `GET /api/v1/models` endpoint returns `{ "data": [...] }`.
It supports pagination (`offset`, `limit`), filtering by comma-separated
`supported_parameters`, output-modality filtering, and server-side sorting. A
model record contains substantially more data than Crow currently retains:

```json
{
  "data": [
    {
      "id": "author/model",
      "canonical_slug": "author/model",
      "name": "Display name",
      "created": 1750000000,
      "description": "...",
      "context_length": 131072,
      "architecture": {
        "modality": "text->text",
        "input_modalities": ["text"],
        "output_modalities": ["text"]
      },
      "pricing": {
        "prompt": "0.000001",
        "completion": "0.000003"
      },
      "supported_parameters": ["reasoning", "include_reasoning"],
      "default_parameters": null,
      "reasoning": {
        "supported_efforts": ["high", "medium", "low", "minimal"],
        "default_effort": "medium",
        "default_enabled": true,
        "supports_max_tokens": true,
        "mandatory": false
      }
    }
  ]
}
```

Non-reasoning models and dynamic routers may omit `reasoning`. OpenRouter says
`supported_efforts: null` means every gateway effort value is accepted, while an
omitted `supported_efforts` means no effort selector is exposed.

### Reasoning detection and options

The `reasoning` object is the strongest signal:

- object present: `reasoning: true`;
- object absent and no reasoning entries in a present `supported_parameters`:
  `reasoning: false`;
- object absent and `supported_parameters` absent: `reasoning: null`;
- embedding output: `reasoning: false`.

Derive UI/request options directly from that object:

| Field                               | Result                                         |
| ----------------------------------- | ---------------------------------------------- |
| `mandatory: false`                  | `toggle`; disabling is allowed                 |
| `mandatory: true`                   | reasoning is always on; do not offer disable   |
| `supported_efforts` present or null | `effort`; preserve exact values/null semantics |
| `supports_max_tokens: true`         | `budget_tokens`; send `reasoning.max_tokens`   |
| `default_enabled`                   | initial on/off state                           |
| `default_effort`                    | initial effort; `none` means off by default    |

OpenRouter's normalized request object supports:

```json
{
  "reasoning": {
    "enabled": true,
    "effort": "high",
    "max_tokens": 2000,
    "exclude": false
  }
}
```

`effort` and `max_tokens` are alternatives for direct control. Gateway effort
values are `max`, `xhigh`, `high`, `medium`, `low`, `minimal`, and `none`, but a
client should prefer each model's `supported_efforts` list. `exclude` controls
whether the reasoning trace is returned, not whether reasoning occurs.

Crow currently ignores OpenRouter's `reasoning` object entirely and infers only
from `supported_parameters`. As a result, a reasoning-capable model currently
becomes `reasoning: null`, and Crow cannot represent mandatory reasoning,
default state, exact effort values, or token budgets.

## Recommended normalization

The existing `reasoningOptions: (toggle | effort | budget_tokens)[]` is too
coarse to preserve provider behavior. A normalized structure should retain:

```json
{
  "reasoning": true,
  "reasoningConfig": {
    "canDisable": true,
    "defaultEnabled": true,
    "efforts": ["high", "medium", "low"],
    "defaultEffort": "medium",
    "supportsTokenBudget": false,
    "canReturnTrace": true
  }
}
```

Keep `reasoning` tri-state:

- `true`: explicit provider metadata establishes support;
- `false`: an authoritative, exhaustive capability list establishes no support,
  or the route is embeddings;
- `null`: metadata is missing or non-authoritative.

Provider-specific mapping should then be:

- **OpenRouter:** direct mapping from the catalog's `reasoning` object, with
  `supported_parameters` as a fallback.
- **Nous:** direct mapping from `reasoning` when present, with
  `supported_parameters` as a fallback; retain `null` where the undocumented
  contract is ambiguous.
- **Ollama:** enrich `/api/tags` with `/api/show`; retain `null` unless an
  explicit capability is returned. Model-family/name tables may be useful as
  advisory data but should not be the authoritative signal.

## Current Crow gaps

1. The OpenRouter parser type does not include the catalog's `reasoning` object.
2. `reasoning`, `include_reasoning`, and `reasoning_effort` currently map only
   to coarse option categories; `budget_tokens` is never produced.
3. A reasoning parameter currently results in `reasoning: null`, even though it
   is positive capability evidence.
4. Ollama's parser ignores the live `/api/tags` `capabilities` field, including
   the explicit `thinking` capability.
5. Crow's Ollama parser expects `details.context_length`, which is not in the
   documented `/api/tags` schema but is present on two of the three live models.
6. Provider configuration names API-key environment variables, but the shared
   catalog fetch currently sends no authorization header. This may matter if
   Nous restricts `/v1/models`.
7. OpenRouter supports pagination, while Crow makes a single unpaginated
   request. OpenRouter currently returns the full list when pagination arguments
   are omitted, so this works under the documented behavior.

## Sources

- [OpenRouter: list all models and their properties](https://openrouter.ai/docs/api/api-reference/models/list-all-models-and-their-properties)
- [OpenRouter: models overview](https://openrouter.ai/docs/guides/overview/models)
- [OpenRouter: reasoning tokens](https://openrouter.ai/docs/guides/best-practices/reasoning-tokens)
- [Ollama: list models](https://docs.ollama.com/api/tags)
- [Ollama: show model details](https://docs.ollama.com/api-reference/show-model-details)
- [Ollama: thinking](https://docs.ollama.com/capabilities/thinking)
- [Ollama: OpenAI compatibility](https://docs.ollama.com/api/openai-compatibility)
- [Nous Portal integration](https://hermes-agent.nousresearch.com/docs/integrations/nous-portal)
