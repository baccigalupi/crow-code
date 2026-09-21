# Cross-provider APIs for AI model data

Research date: 2026-09-21

## Scope

This document includes only sources that aggregate model data across multiple
model creators or inference providers. Provider-native catalog APIs such as
OpenAI, Anthropic, Gemini, Bedrock, Mistral, Together, and Fireworks are
intentionally excluded.

The remaining APIs answer different questions:

- **Models.dev**: What models exist, which providers offer them, and what are
  their normalized specifications and prices?
- **OpenRouter**: What models and provider routes are available through
  OpenRouter, at what price and observed performance?
- **Vercel AI Gateway**: What models and provider routes are available through
  Vercel's gateway, at what price and observed performance?
- **Hugging Face**: Which providers serve each Hub model, under which provider
  ID and task, and with what live price, limits, capabilities, and performance?
- **Artificial Analysis**: How do models and providers compare on independent
  evaluations, price, latency, and throughput?
- **LiteLLM model cost map**: What pricing, limits, capabilities, and provider
  mappings does LiteLLM use across its supported providers?
- **Portkey Models**: What pricing and configuration does Portkey publish across
  its supported providers?

A record in an aggregator does not prove that a provider will accept a request
from a particular account, region, or credential. It establishes catalog or
gateway availability only within the scope described below.

## Comparison

| Source              | Coverage                                   | Provider-specific entries |  Capabilities and limits |               Prices |                       Measured quality/performance |                  Public access |
| ------------------- | ------------------------------------------ | ------------------------: | -----------------------: | -------------------: | -------------------------------------------------: | -----------------------------: |
| Models.dev          | Broad model and provider catalog           |                       Yes |                   Strong |               Strong |                         Limited sourced benchmarks |                            Yes |
| OpenRouter          | Routes sold through OpenRouter             |                       Yes |                   Strong |               Strong | Route latency, throughput, uptime; some benchmarks |                            Yes |
| Vercel AI Gateway   | Routes sold through Vercel AI Gateway      |                       Yes |                   Strong |               Strong |                  Route latency, throughput, uptime |                            Yes |
| Hugging Face        | Hub models mapped to inference providers   |                       Yes | Strong for served models | Strong when reported |                Latest-probe latency and throughput |                            Yes |
| Artificial Analysis | Independently tracked models and providers |       Yes on higher tiers | Medium to strong by tier |               Strong |                                             Strong |                API key; tiered |
| LiteLLM cost map    | Models supported by LiteLLM                |                       Yes |                   Strong |               Strong |                                                 No |               Yes, static JSON |
| Portkey Models      | Models configured by Portkey               |                       Yes |                   Medium |               Strong |                                                 No | Yes; provider-scoped endpoints |

## 1. Models.dev

### Endpoints and access

Models.dev exposes unauthenticated JSON snapshots:

- `GET https://models.dev/models.json` — canonical, provider-independent models
- `GET https://models.dev/api.json` — providers and their model offerings
- `GET https://models.dev/catalog.json` — canonical models and provider data
  together

It also publishes `@opencode-ai/models`, a type-safe npm snapshot for offline
use. Its source data is public TOML rather than an opaque service database.

### Canonical model data

`models.json` describes a model independently of any provider route.

| Field                                   | Meaning                                                               |
| --------------------------------------- | --------------------------------------------------------------------- |
| `id`                                    | Canonical `lab/model` identity; not necessarily callable              |
| `name`, `description`, `family`         | Display and family metadata                                           |
| `attachment`                            | Attachment-style input support                                        |
| `reasoning`                             | Reasoning capability                                                  |
| `reasoning_options`                     | Known controls such as toggles, token budgets, or effort levels       |
| `tool_call`                             | Tool/function calling support                                         |
| `structured_output`                     | Structured-output support                                             |
| `temperature`                           | Whether temperature is accepted or meaningful                         |
| `knowledge`                             | Reported knowledge cutoff, when known                                 |
| `release_date`                          | Model release date                                                    |
| `last_updated`                          | Last reported model or record update                                  |
| `modalities.input`, `modalities.output` | Accepted and generated media types                                    |
| `open_weights`                          | Whether model weights are publicly available                          |
| `license`                               | Reported weights license                                              |
| `weights`                               | Links and formats for published weights                               |
| `limit.context`                         | Total context-window limit                                            |
| `limit.input`, `limit.output`           | Separate input and output limits when known                           |
| `links`                                 | Papers, model cards, announcements, and documentation                 |
| `benchmarks`                            | Sourced scores, with metric, harness, version, and date when supplied |

An absent optional field means unknown or unrecorded, not `false`, zero, or
unlimited.

### Provider data

`api.json` and the provider section of `catalog.json` describe offers of those
models by many inference providers.

| Field                                 | Meaning                                            |
| ------------------------------------- | -------------------------------------------------- |
| provider `id`, `name`                 | Models.dev provider identity and display name      |
| `api`                                 | Provider API base URL                              |
| `doc`                                 | Provider documentation URL                         |
| `env`                                 | Conventional credential environment-variable names |
| `npm`                                 | AI SDK provider package                            |
| model `id`                            | Provider-callable model identifier                 |
| `cost.input`, `cost.output`           | USD per million input or output tokens             |
| `cost.cache_read`, `cost.cache_write` | Cache prices per million tokens                    |
| `limit.*`                             | Limits for this provider's offering                |
| capability fields                     | Features supported on this provider route          |

Costs and capabilities belong to the provider offering, not universally to the
canonical model. The same model can have different identifiers, limits,
features, and prices at different providers.

### Strengths and limitations

Models.dev is the most useful starting point for joining one underlying model to
many provider offerings. It is curated rather than a live provider control
plane. It does not prove account access, regional availability, route health, or
current capacity. Its dates and sources should be retained when data is used for
billing or request validation.

Sources:
[Models.dev provider catalog and API instructions](https://models.dev/providers/),
[`models.json`](https://models.dev/models.json), and
[`catalog.json`](https://models.dev/catalog.json).

## 2. OpenRouter Models API

### Endpoints and access

- `GET https://openrouter.ai/api/v1/models`
- `GET https://openrouter.ai/api/v1/model/{author}/{slug}`

The model list is publicly readable. Omitting pagination returns the full list;
`offset` and `limit` enable pagination. `output_modalities=all` is required for
a complete catalog because the default includes only text-output models.
`supported_parameters` filters by request features.

### Model data

| Field                            | Meaning                                                      |
| -------------------------------- | ------------------------------------------------------------ |
| `id`                             | Identifier accepted by OpenRouter inference requests         |
| `canonical_slug`                 | Stable canonical OpenRouter slug                             |
| `alias_target`                   | Concrete target when the entry is an alias                   |
| `name`, `description`            | Display metadata                                             |
| `created`                        | Time added to OpenRouter, not necessarily model release time |
| `expiration_date`                | Announced OpenRouter endpoint expiration                     |
| `knowledge_cutoff`               | Reported model knowledge cutoff                              |
| `context_length`                 | Maximum context exposed by the catalog entry                 |
| `architecture.input_modalities`  | Accepted input media                                         |
| `architecture.output_modalities` | Generated output media                                       |
| `architecture.tokenizer`         | Tokenizer family used for estimation                         |
| `architecture.instruct_type`     | Prompt/instruction format where applicable                   |
| `pricing`                        | OpenRouter per-unit prices as decimal strings                |
| `top_provider`                   | Limits and moderation status of the preferred route          |
| `supported_parameters`           | Request parameters OpenRouter supports for the model         |
| `default_parameters`             | Reported or applied defaults                                 |
| `reasoning`                      | Reasoning defaults, requirement, and effort levels           |
| `benchmarks`                     | Third-party benchmark summaries when available               |
| `per_request_limits`             | OpenRouter request restrictions                              |
| `supported_voices`               | Voice identifiers for applicable models                      |
| `links.details`                  | Route for provider-endpoint details                          |

The provider-endpoint detail linked from a model is the important cross-provider
layer. It distinguishes the providers serving the same model and can expose
route-specific price, context, quantization, uptime, latency, and throughput.
These are OpenRouter's routes and measurements, not universal facts about the
upstream provider.

### Strengths and limitations

This is a strong source for models that can be routed through OpenRouter and for
comparing upstream routes available there. `pricing` is OpenRouter pricing.
`top_provider` is the preferred OpenRouter route, not a summary of all
providers. A catalog entry does not guarantee that a route is healthy or
permitted by the caller's routing, privacy, region, or spending settings.

Source:
[OpenRouter Models API guide and schema](https://openrouter.ai/docs/guides/overview/models).

## 3. Vercel AI Gateway Models API

### Endpoints and access

- `GET https://ai-gateway.vercel.sh/v1/models`
- `GET https://ai-gateway.vercel.sh/v1/models/{creator}/{model}/endpoints`

Both discovery endpoints are documented as unauthenticated. The API follows the
OpenAI models-list format while adding catalog metadata.

### Model data

| Field                             | Meaning                                                      |
| --------------------------------- | ------------------------------------------------------------ |
| `id`                              | Gateway model identifier in `creator/model` form             |
| `created`                         | Catalog creation timestamp                                   |
| `released`                        | Reported model release timestamp                             |
| `owned_by`                        | Model creator                                                |
| `name`, `description`             | Display metadata                                             |
| `context_window`                  | Maximum context window                                       |
| `max_tokens`                      | Maximum output tokens                                        |
| `type`                            | Model class, such as language                                |
| `tags`                            | Capabilities such as file input, tools, reasoning, or vision |
| `pricing.input`, `pricing.output` | Gateway token prices                                         |
| cache pricing fields              | Cache read/write prices when applicable                      |
| reasoning controls                | Supported reasoning toggles, budgets, or effort levels       |
| supported parameters              | Request controls accepted through the gateway                |
| modalities                        | Supported input and output media                             |

The per-model `/endpoints` route lists every provider endpoint serving the
model. Vercel documents per-route context, input/output pricing,
time-to-first-token latency, throughput, and uptime. This makes the endpoint API
more valuable for provider comparison than the top-level model record.

### Strengths and limitations

This API is a close alternative to OpenRouter for comparing routes behind a
single gateway. Its prices and availability describe Vercel AI Gateway, not a
direct contract with each upstream provider. Performance is observed route
performance and depends on measurement window and traffic conditions.

Sources:
[Vercel AI Gateway REST API reference](https://vercel.com/docs/ai-gateway/sdks-and-apis/rest-api)
and
[Vercel models and providers guide](https://vercel.com/docs/ai-gateway/models-and-providers).

## 4. Hugging Face Hub and Inference Providers APIs

### Endpoints and access

Hugging Face exposes two complementary cross-provider views:

- `GET https://huggingface.co/api/models?inference_provider=all` lists Hub
  models served by at least one integrated inference provider.
- `GET https://huggingface.co/api/models/{namespace}/{model}?expand[]=inferenceProviderMapping`
  returns the providers serving one model and their provider-specific IDs.
- `GET https://router.huggingface.co/v1/models` lists chat-completion models
  with provider metadata used for routing and comparison.
- `GET https://router.huggingface.co/v1/models/{namespace}/{model}` retrieves
  one router model and all reported provider routes.

The Hub list can filter one provider, a comma-separated set of providers, or
`all`. It can combine that with `pipeline_tag` and other Hub filters. Public
model discovery is unauthenticated; actually invoking routed inference uses
Hugging Face authentication and account/provider configuration.

### Hub model-to-provider mapping

`inferenceProviderMapping` is keyed by provider and contains:

| Field           | Meaning                                                            |
| --------------- | ------------------------------------------------------------------ |
| provider key    | Hugging Face inference-provider identifier                         |
| `status`        | Mapping state, documented as `staging` or `live`                   |
| `providerId`    | Identifier used by that provider for the model                     |
| `task`          | Provider task, also known in the Hub ecosystem as the pipeline tag |
| `isModelAuthor` | Whether the provider is also the model publisher                   |

This mapping is important because a Hub repository ID and a provider's callable
model ID can differ. `inference_provider=all` means at least one provider has a
mapping; it does not mean every integrated provider serves the model.

The separate `inference` expansion reports `warm` or is absent. `warm` indicates
that at least one provider is serving the model. An absent value does not erase
the repository or imply that the model cannot be self-hosted.

### Router model and provider data

The OpenAI-compatible router endpoint returns model identity, creation time,
owner, and input/output architecture. Each model has a `providers` array whose
entries may include:

| Field                             | Meaning                                                   |
| --------------------------------- | --------------------------------------------------------- |
| `provider`                        | Inference-provider identifier                             |
| `status`                          | Current router status, documented as `live` or `error`    |
| `context_length`                  | Context supported by this provider route                  |
| `pricing.input`, `pricing.output` | USD per million tokens                                    |
| `is_free`                         | Temporary free-of-charge status when applicable           |
| `supports_tools`                  | Tool-calling support on this provider route               |
| `supports_structured_output`      | Structured-output support on this provider route          |
| `first_token_latency_ms`          | Time to first token from the latest validation probe      |
| `throughput`                      | Output tokens per second from the latest validation probe |
| `is_model_author`                 | Whether the provider published the model                  |

These fields are optional. Missing price, capability, or probe data means not
reported, not zero or unsupported. The latency and throughput values are the
latest validation probe rather than a long-term distribution.

### Strengths and limitations

Hugging Face is a genuine cross-provider source: it joins canonical Hub model
repositories to provider-specific model IDs and live routes across multiple
inference companies. It also covers tasks beyond chat, including image, video,
speech, and feature extraction through Hub filtering and provider mappings.

Its repository metadata remains useful for licenses, weights, model cards,
frameworks, parameter counts, and artifacts, while its Inference Providers data
adds serving-provider identity and route status. A `live` mapping still does not
guarantee access for a particular account, sufficient quota, or successful
routing at request time.

Sources:
[Hugging Face Inference Providers Hub API](https://huggingface.co/docs/inference-providers/hub-api),
[Inference Providers overview](https://huggingface.co/docs/inference-providers/main/en/index),
and [Hub API specification](https://huggingface.co/.well-known/openapi.md).

## 5. Artificial Analysis Data API

### Endpoints and access

- `GET https://artificialanalysis.ai/api/v2/language/models/free`
- `GET https://artificialanalysis.ai/api/v2/language/models`
- `GET https://artificialanalysis.ai/api/v2/language/models/{slug}`
- `GET https://artificialanalysis.ai/api/v2/language/models/{slug}/performance`
- provider list, detail, and performance routes under
  `/api/v2/language/providers`

All requests use `x-api-key`. The free tier provides model identity, headline
indices, median performance, and input/output pricing. Pro adds model-level
detail. Commercial adds provider-level data, performance over time, and expanded
measurement access. The legacy `/api/v2/data/llms/models` endpoint is scheduled
for retirement on 2026-11-04 and should not be adopted.

### Data and meaning

| Data group                         | Meaning                                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| identity                           | Stable Artificial Analysis ID, mutable display name, slug, and creator              |
| evaluations                        | Intelligence, coding, math, and individual benchmark results                        |
| pricing                            | Input, output, and richer-tier blended prices                                       |
| output speed                       | Median generated tokens per second                                                  |
| time to first token                | Median delay before output begins                                                   |
| latency and throughput percentiles | Distributional measurements on richer tiers                                         |
| provider records                   | Provider-specific price and performance observations                                |
| model metadata                     | Context, modalities, parameters, license, openness, and release information by tier |

Performance queries use a declared `prompt_type`, such as medium, long, 100k,
vision, coding, or parallel. Provider, prompt length, concurrency, measurement
window, and date are necessary dimensions of every performance value.

### Strengths and limitations

Artificial Analysis is the strongest option here for independent model and
provider comparison. It is not an inference gateway, so inclusion does not mean
a model is callable by the user. Provider-level data requires a higher tier, and
redistribution rights depend on the subscription and license terms.

Sources:
[Artificial Analysis Data API documentation](https://artificialanalysis.ai/data-api/docs)
and
[legacy endpoint migration notice](https://artificialanalysis.ai/data-api/migrate-v2-data).

## 6. LiteLLM model cost map

### Endpoint and access

LiteLLM publishes its cross-provider map as public static JSON:

`GET https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json`

This is not a versioned service API. It is the live data file LiteLLM uses for
cost calculation, model metadata, and capability checks. Consumers can pin a Git
commit instead of `main` when reproducibility matters.

### Data and meaning

The documented schema includes:

| Field group                                     | Meaning                                                                                                           |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| model key and `aliases`                         | Provider/model lookup identity and alternate names                                                                |
| `litellm_provider`                              | LiteLLM provider adapter owning the entry                                                                         |
| `mode`                                          | Chat, completion, embedding, image, audio, moderation, rerank, search, and other operation classes                |
| `input_cost_per_token`, `output_cost_per_token` | Base per-token prices                                                                                             |
| cache price fields                              | Cache-read and cache-creation prices                                                                              |
| media price fields                              | Audio, image, video, or per-second prices when applicable                                                         |
| service and long-context price fields           | Tier-specific prices above token thresholds or for priority service                                               |
| `max_input_tokens`, `max_output_tokens`         | Separate token limits                                                                                             |
| `max_tokens`                                    | Legacy fallback limit field                                                                                       |
| `deprecation_date`                              | Reported provider deprecation date                                                                                |
| `supported_regions`                             | Regions recorded for the offering                                                                                 |
| capability booleans                             | Function calling, parallel tools, vision, audio, reasoning, prompt caching, response schema, and related features |

Costs are generally stored per token rather than per million tokens. Consumers
must inspect the particular field's documented unit instead of assuming one unit
for the entire map.

### Strengths and limitations

This is broad and operationally useful because it drives LiteLLM behavior. It is
community-maintained configuration, not a live availability API. A listed model
may require a particular provider prefix, region, deployment, or account
permission. Floating `main` can change without a schema version, so production
ingestion should validate fields and retain the source commit.

Sources:
[LiteLLM pricing and context schema](https://docs.litellm.ai/docs/provider_registration/add_model_pricing)
and
[LiteLLM custom model cost map behavior](https://docs.litellm.ai/docs/proxy/custom_model_cost_map).

## 7. Portkey Models

### Endpoints and access

Portkey publishes provider-scoped model data without an API key:

- `GET https://configs.portkey.ai/pricing/{provider}.json` — all recorded models
  for one provider
- `GET https://api.portkey.ai/model-configs/pricing/{provider}/{model}` — one
  model's pricing
- corresponding model-configuration routes documented by Portkey

Portkey also has an authenticated `GET /v1/models` endpoint for a workspace's
integrated Model Catalog. Without provider-routing headers it returns models
configured across that workspace's providers. With a provider route it proxies
and normalizes that upstream provider's model list instead.

### Data and meaning

The public Portkey Models database covers more than one provider and includes:

- provider and exact provider model identifier;
- input, output, cache, image, audio, and other applicable price units;
- context and output limits where recorded;
- supported parameters and capabilities;
- provider-specific configuration used by Portkey.

The workspace Model Catalog adds the operational identity
`@provider-slug/model`, workspace visibility, configured provider integration,
input/output limits, and price where available.

### Strengths and limitations

The public API is useful for provider-specific price lookup, but discovery is
provider-by-provider rather than one all-provider response. The authenticated
Model Catalog is useful when Portkey is already the organization's gateway: it
answers which models that workspace is configured to route to, not every model
in the market. Proxied `/v1/models` results inherit the upstream provider's
coverage and sparse OpenAI-compatible schema.

Sources:
[Portkey Models public database and API](https://portkey.ai/docs/product/model-catalog/portkey-models)
and
[Portkey Models API behavior](https://portkey.ai/docs/api-reference/inference-api/models/models).

## Recommended use

### Broad canonical catalog

Use Models.dev as the primary model-to-provider join. Keep its canonical model
ID separate from each provider's model ID.

### Gateway route comparison

Use OpenRouter, Vercel, or Hugging Face router data when the application can
route through that gateway. Their performance and prices describe observed
provider routes and are not safely transferable to direct provider calls.
Hugging Face is especially useful when the Hub repository is the canonical model
identity or when discovery must include image, video, speech, and
feature-extraction tasks as well as chat.

### Independent ratings

Use Artificial Analysis for model quality and provider performance. Preserve the
evaluation version, provider, prompt preset, concurrency, date, and measurement
window with every value.

### Secondary price and capability coverage

Use LiteLLM and Portkey to fill gaps or cross-check model limits, capabilities,
and prices. Treat disagreement as a provenance problem to preserve, not a value
to average. For billing decisions, verify against the provider or gateway that
will actually charge the request.

## Data-model requirements

A combined registry should not collapse all observations into one model row. At
minimum, retain:

- canonical model identity;
- source and source-specific model identity;
- inference provider or gateway route;
- region and product surface when supplied;
- source URL and observation timestamp;
- price currency, unit, tier, and token threshold;
- context, input, and output limits as separate nullable values;
- declared capabilities separately from measured behavior;
- benchmark name, version, harness, and date;
- performance prompt shape, concurrency, percentile, and measurement window.

Missing data means unknown. It must not be converted to `false`, zero, or
unlimited.
