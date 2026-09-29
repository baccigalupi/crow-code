# Model cost brackets

## Recommendation

Group models into six brackets using output cost per million tokens:

| Bracket  |     Output cost per 1M tokens | Models | Share of priced models |
| -------- | ----------------------------: | -----: | ---------------------: |
| Free     |                            $0 |     66 |                   7.5% |
| Cheap    |    More than $0 through $0.25 |    102 |                  11.6% |
| Budget   | More than $0.25 through $1.70 |    257 |                  29.3% |
| Standard |   More than $1.70 through $15 |    376 |                  42.8% |
| Premium  |     More than $15 through $30 |     36 |                   4.1% |
| Ultra    |    More than $30 through $600 |     41 |                   4.7% |

Models without a fixed output cost should be shown as `Variable/unknown` rather
than placed in a cost bracket. This is a pricing state, not another cost
bracket.

## Rationale

- **Free** is a meaningful product distinction and includes local Ollama models,
  `openrouter/free`, free-tagged hosted models, and zero-priced embedding
  models.
- **Cheap** retains the application's existing cheap-model threshold:
  `cost_output <= 0.25`.
- **Budget** ends at $1.70, inside the largest observed gap below $2.50:
  $1.60–$1.74.
- **Standard** covers the mainstream catalog from above $1.70 through $15 per
  million output tokens.
- **Premium** captures the distinct $18.15–$30 price band.
- **Ultra** begins after the $30–$37.50 natural price gap and isolates the most
  expensive 4.7% of fixed-price catalog records.

Representative records include GPT-5 Nano Batch and Gemini 2.5 Flash Lite Batch
in Cheap; GPT-5 Nano and GPT-5 Mini Batch in Budget; Claude Sonnet models and
GPT-5.4 in Standard; Claude Opus models and GPT-5.5 in Premium; and the GPT-5
Pro family and O1 Pro in Ultra.

## Database findings

The analysis queried `.crow/crow.db` on 2026-09-29.

- Total model records: **884**
- Records with a fixed output cost: **878**
- Free records: **66**
- Records with a variable or unknown output cost: **6**
- Fixed output-cost range: **$0 to $600 per million tokens**

Records are provider-specific, so the same model identifier offered by multiple
providers is counted once per provider record. The counts describe catalog
records, not necessarily unique model identifiers.

The output-cost distribution by decile was:

| Decile | Minimum | Maximum | Records |
| -----: | ------: | ------: | ------: |
|      1 |      $0 |  $0.112 |      88 |
|      2 |  $0.112 |   $0.28 |      88 |
|      3 |   $0.28 |   $0.60 |      88 |
|      4 |   $0.60 |   $1.02 |      88 |
|      5 | $1.0287 |  $1.875 |      88 |
|      6 |  $1.875 |   $2.50 |      88 |
|      7 |   $2.50 |      $5 |      88 |
|      8 |      $5 |     $10 |      88 |
|      9 |     $10 |     $15 |      87 |
|     10 |     $15 |    $600 |      87 |

The proposed boundaries favor recognizable market price bands over equal-sized
quantiles. They preserve the existing $0.25 cheap-model threshold, use the
largest observed sub-$2.50 gap for the $1.70 Budget boundary, place Premium
between the gaps above $15 and $30, and reserve the highly skewed tail for
Ultra.

## Data representation

The `models` table stores `cost_input` and `cost_output` as nullable
floating-point values. Provider parsers normalize per-token API prices to prices
per million tokens. Dynamic delegation records use `NULL` when a fixed cost is
unavailable.

## Alternative boundaries

There is no strong natural price gap between $0.25 and $2.50. The recommended
$1.70 Budget boundary falls inside the largest gap, between $1.60 and $1.74. It
places **257 models**, or **29.3%** of fixed-price records, in Budget. A $2.50
boundary would instead place **365 models**, or **41.6%**, in Budget.

The recommended $15 Standard/Premium boundary is followed by a $3.15 gap to
$18.15. Premium then contains 36 models between $18.15 and $30. The recommended
$30 Premium/Ultra boundary is followed by the larger $7.50 gap to $37.50,
leaving 41 models in Ultra.
