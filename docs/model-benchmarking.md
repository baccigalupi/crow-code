# Model benchmarking data sources

Research date: 2026-09-21

## Scope

This document lists public sources that publish model benchmark scores and
evaluation data. It excludes provider catalogs, gateway route APIs, and
pricing/configuration maps.

## Benchmark data sources

| Source              | What it measures                                                            | Models     | Dataset / scope              | Section |
| ------------------- | --------------------------------------------------------------------------- | ---------- | ---------------------------- | ------: |
| Artificial Analysis | Independent evaluations: intelligence, coding, latency, throughput, pricing | 300+       | tiered access                |      §1 |
| BenchLM             | Composite benchmark score across 8 categories                               | 231 ranked | 505 tracked                  |      §2 |
| MMLU-Pro            | Knowledge/reasoning accuracy across 14 subjects                             | 50+        | 14 subject domains           |      §3 |
| SWE-bench Verified  | Real-world GitHub issue resolution (Python)                                 | 50+        | 500 tasks                    |      §4 |
| SWE-bench-Live      | Auto-updating multi-language issue resolution                               | growing    | monthly updates, 8 languages |      §5 |
| LiveCodeBench       | Competitive coding (LeetCode, AtCoder, CodeForces)                          | 50+        | 1055+ problems (v6)          |      §6 |
| GPQA Diamond        | Graduate-level science reasoning                                            | 489+       | 198 questions                |      §7 |
| Chatbot Arena       | Crowdsourced human-preference ELO ratings                                   | 300+       | 10 arenas                    |      §8 |
| Aider Polyglot      | Multi-language code editing via tool use                                    | 46+        | 225 exercises, 6 languages   |      §9 |
| HF Leaderboard API  | Unified API across all Hugging Face official benchmarks                     | all HF     | all official benchmarks      |     §10 |

## 1. Artificial Analysis Data API

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

## 2. BenchLM

### Endpoints and access

BenchLM publishes read-only JSON data and an event API without requiring an API
key:

- `GET https://benchlm.ai/api/data/leaderboard` — ranked models with overall
  scores, category scores, evidence status, confidence intervals, and headline
  pricing.
- `GET https://benchlm.ai/api/data/pricing` — pricing-focused export.
- `GET https://benchlm.ai/llms.txt` — crawler index of available pages.
- `GET https://benchlm.ai/radar/api/v1/events` — source-linked provider events
  such as model releases, pricing changes, and lifecycle events. Cursor-based
  pagination; revocable keys available.
- `GET https://benchlm.ai/embed/leaderboard` — embeddable leaderboard view.

### Data and meaning

`leaderboard.json` contains one record per ranked model:

| Field                | Meaning                                                       |
| -------------------- | ------------------------------------------------------------- |
| `rank`               | Leaderboard position                                          |
| `model`              | Display model name                                            |
| `creator`            | Model creator / lab                                           |
| `overallScore`       | Composite BenchAlign score                                    |
| `categoryScores`     | Scores for agentic, coding, reasoning, multimodal & grounded, |
|                      | knowledge, multilingual, instruction following, and math      |
| `categoryRanks`      | Rank within each scored category                              |
| `categoryEvidence`   | `supported` or `estimated` per category                       |
| `inputPrice`         | Reported input price per 1M tokens, when known                |
| `outputPrice`        | Reported output price per 1M tokens, when known               |
| `evidenceStatus`     | `supported` or `estimated` overall                            |
| `interval90`         | 90% confidence interval around the overall score              |
| `methodologyVersion` | BenchAlign version used for the score                         |

### Scoring methodology

BenchLM computes scores from a benchmark backbone rather than importing another
aggregator’s index. The overall score is a weighted average across eight
categories:

| Category              | Weight |
| --------------------- | -----: |
| Agentic               |    22% |
| Coding                |    20% |
| Reasoning             |    17% |
| Multimodal & Grounded |    12% |
| Knowledge             |    12% |
| Multilingual          |     7% |
| Instruction Following |     5% |
| Math                  |     5% |

The coding category, for example, is built from benchmark-native rows such as
SWE-bench Pro, LiveCodeBench, and SWE-bench Verified. Artificial Analysis
indices such as the Artificial Analysis Intelligence Index and AA Briefcase are
tracked as display-only references and are explicitly excluded from the weighted
scoring formula.

### Strengths and limitations

BenchLM is a strong public source for composite, category-level benchmark scores
and leaderboard rank. The data is unauthenticated, includes confidence signals,
and exposes both overall and per-category scores.

It is not an inference gateway: it does not prove that a model is callable on a
particular provider route. Pricing is headline API pricing, not
provider-specific contract or regional pricing. Scores are composites derived
from published benchmarks, not direct measurements of latency, throughput, or
provider route availability.

Sources: [BenchLM dataset](https://benchlm.ai/data),
[BenchLM methodology](https://benchlm.ai/methodology), and
[BenchLM Radar API](https://benchlm.ai/radar/api).

## 3. MMLU-Pro

### Endpoints and access

MMLU-Pro is a benchmark dataset and leaderboard hosted on Hugging Face:

- `GET https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro` — dataset with
  questions and subject splits.
- `GET https://huggingface.co/spaces/TIGER-Lab/MMLU-Pro` — public leaderboard.
- `GET https://huggingface.co/datasets/TIGER-Lab/mmlu_pro_leaderboard_submission`
  — submitted evaluation results.

Access is unauthenticated for reads through the Hugging Face Hub.

### Data and meaning

Each leaderboard entry contains:

| Field               | Meaning                                        |
| ------------------- | ---------------------------------------------- |
| `model`             | Model name or identifier used by the submitter |
| `prompting`         | `CoT` or `Direct`                              |
| `overall`           | Aggregate accuracy                             |
| per-subject columns | Accuracy for each of the 14 domains            |

The 14 domains are biology, business, chemistry, computer science, economics,
engineering, health, history, law, math, philosophy, physics, psychology, and
other.

### Scoring methodology

MMLU-Pro increases answer choices from 4 (original MMLU) to 10, adds
reasoning-focused questions, and removes trivial or noisy items. Scores are
reported as accuracy under 5-shot CoT or direct prompting, though some models
such as Gemini are evaluated 0-shot.

### Strengths and limitations

MMLU-Pro is useful as a free, public knowledge-and-reasoning benchmark with
broad open-weight and proprietary model coverage. Because it is a static dataset
rather than a live API, leaderboard entries depend on who submitted the
evaluation and which prompt template they used. It does not cover coding,
agentic tasks, pricing, or provider routing.

Sources:
[TIGER-Lab/MMLU-Pro dataset](https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro),
[MMLU-Pro leaderboard](https://huggingface.co/spaces/TIGER-Lab/MMLU-Pro), and
[arXiv:2406.01574](https://arxiv.org/abs/2406.01574).

## 4. SWE-bench Verified

### Endpoints and access

SWE-bench Verified is a human-validated subset of 500 tasks from SWE-bench,
hosted on Hugging Face:

- `GET https://huggingface.co/api/datasets/SWE-bench/SWE-bench_Verified/leaderboard`
  — ranked model scores via the Hugging Face Leaderboard API.
- Dataset: `SWE-bench/SWE-bench_Verified` on Hugging Face Hub.
- Leaderboard website: `https://www.swebench.com/verified`.

Access is unauthenticated for reads. The leaderboard API returns typed entries
with rank, model ID, score, verification status, and submission source.

### Data and meaning

Each task is a real GitHub issue-pull request pair from popular Python
repositories. Evaluation is unit-test verification using post-PR behavior as the
reference solution.

| Field               | Meaning                                                |
| ------------------- | ------------------------------------------------------ |
| `instance_id`       | Formatted `repo_owner__repo_name-PR-number` identifier |
| `problem_statement` | Issue title and body provided to the model             |
| `base_commit`       | Repository HEAD before the solution PR                 |
| `patch`             | Gold patch that resolved the issue (minus test code)   |
| `test_patch`        | Test-file patch contributed by the solution PR         |
| `FAIL_TO_PASS`      | Tests that should transition from failing to passing   |
| `PASS_TO_PASS`      | Tests that should remain passing                       |

The leaderboard distinguishes full agent systems from minimal agent (bash-only)
evaluations for apples-to-apples LLM comparison.

### Strengths and limitations

SWE-bench Verified is the most widely cited coding agent benchmark. Human
validation ensures task quality. It is Python-only and limited to 500 fixed
tasks, so it can saturate and does not cover other languages.

Sources:
[SWE-bench Verified dataset](https://huggingface.co/datasets/SWE-bench/SWE-bench_Verified),
[SWE-bench Verified leaderboard](https://www.swebench.com/verified), and
[OpenAI blog post on verification process](https://openai.com/index/introducing-swe-bench-verified/).

## 5. SWE-bench-Live

### Endpoints and access

SWE-bench-Live is an auto-updating, multi-language variant of SWE-bench:

- Dataset: `SWE-bench-Live/SWE-bench-Live` on Hugging Face Hub (Python).
- Dataset: `SWE-bench-Live/MultiLang` on Hugging Face Hub (C, C++, C#, Java, Go,
  JS/TS, Rust, Python).
- Dataset: `SWE-bench-Live/Windows` on Hugging Face Hub (Windows PowerShell
  tasks).
- Leaderboard: `https://swe-bench-live.github.io/`.

Access is unauthenticated. The dataset is updated monthly via an automated
curation pipeline.

### Data and meaning

The schema matches SWE-bench Verified with the addition of `image_key` (docker
image for the task instance), `test_cmds` (commands to run the test suite), and
`log_parser` type. Evaluation follows the original SWE-bench protocol: the agent
receives only `problem_statement` and the docker image.

### Strengths and limitations

SWE-bench-Live addresses the two main limitations of SWE-bench Verified: it is
continuously updated (reducing contamination risk) and covers multiple languages
and operating systems. The lite and verified splits remain frozen for fair
comparison. It is newer and has fewer submitted results than SWE-bench Verified.

Sources:
[SWE-bench-Live repository](https://github.com/microsoft/SWE-bench-Live),
[SWE-bench-Live dataset](https://huggingface.co/datasets/SWE-bench-Live/SWE-bench-Live),
and [SWE-bench-Live leaderboard](https://swe-bench-live.github.io/).

## 6. LiveCodeBench

### Endpoints and access

LiveCodeBench collects competitive coding problems from LeetCode, AtCoder, and
CodeForces:

- Dataset: `livecodebench/code_generation_lite` on Hugging Face Hub.
- Leaderboard: `https://livecodebench.com/`.
- GitHub: `https://github.com/LiveCodeBench/LiveCodeBench`.

Access is unauthenticated. Versioned releases allow time-segmented evaluation:

| Version      | Period              | Problems |
| ------------ | ------------------- | -------: |
| `release_v1` | May 2023 – Mar 2024 |      400 |
| `release_v2` | May 2023 – May 2024 |      511 |
| `release_v3` | May 2023 – Jul 2024 |      612 |
| `release_v4` | May 2023 – Sep 2024 |      713 |
| `release_v5` | May 2023 – Jan 2025 |      880 |
| `release_v6` | May 2023 – Apr 2025 |     1055 |

### Data and meaning

Each problem includes a description, input/output examples, hidden test cases
(59+ on average), difficulty level, and release date. Evaluation covers code
generation, self-repair, code execution, and test output prediction.

### Strengths and limitations

LiveCodeBench is the strongest contamination-free coding benchmark because
problems are collected continuously from live competitions. Time-segmented
evaluation detects training-data contamination. It measures competitive
algorithm-style coding, not real-world software engineering (unlike SWE-bench).

Sources:
[LiveCodeBench dataset](https://huggingface.co/datasets/livecodebench/code_generation_lite),
[LiveCodeBench leaderboard](https://livecodebench.com/), and
[arXiv:2403.07974](https://arxiv.org/abs/2403.07974).

## 7. GPQA Diamond

### Endpoints and access

GPQA Diamond is a 198-question subset of GPQA hosted on Hugging Face:

- Dataset: `Idavidrein/gpqa` on Hugging Face Hub.
- Leaderboard via Epoch AI: `https://epoch.ai/benchmarks/gpqa-diamond`.
- Leaderboard via Artificial Analysis:
  `https://artificialanalysis.ai/evaluations/gpqa-diamond`.

Access is unauthenticated. Multiple independent evaluators (Epoch AI, Artificial
Analysis, Sophon) publish scores.

### Data and meaning

Questions are multiple-choice (4 options) in biology, physics, and chemistry,
written by PhD-level domain experts. The Diamond subset retains only questions
where experts answered correctly and non-experts answered incorrectly.

| Baseline    | Accuracy |
| ----------- | -------: |
| Random      |      25% |
| Non-experts |      34% |
| PhD experts |      65% |

### Strengths and limitations

GPQA Diamond is the standard graduate-level science reasoning benchmark. It is
genuinely difficult (designed to be "Google-proof") and has broad model
coverage. It is limited to science domains and is a static 198-question set that
does not update.

Sources: [GPQA dataset](https://huggingface.co/datasets/Idavidrein/gpqa),
[Epoch AI evaluations](https://epoch.ai/benchmarks/gpqa-diamond), and
[arXiv:2311.12022](https://arxiv.org/abs/2311.12022).

## 8. Chatbot Arena

### Endpoints and access

Chatbot Arena (now Arena, formerly LMSYS Chatbot Arena) is a crowdsourced
human-preference leaderboard. Arena does not provide an official public API.
Data is accessible through:

- Community mirror API (unauthenticated):
  `GET https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboards` — list all
  leaderboard categories.
  `GET https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=text` —
  latest text arena rankings.
  `GET https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=text&date=YYYY-MM-DD`
  — historical snapshot.
- Raw GitHub JSON:
  `https://raw.githubusercontent.com/oolong-tea-2026/arena-ai-leaderboards/main/data/latest.json`.
- Preference dataset: `lmarena-ai/arena-human-preference-140k` on Hugging Face
  Hub.
- Ranking methodology: `lmarena/arena-rank` on GitHub (Bradley-Terry ELO
  computation).

Arena categories include text, agent, code/webdev, text-to-image, image-edit,
text-to-video, image-to-video, and video-edit.

### Data and meaning

Each leaderboard entry contains:

| Field     | Meaning                                     |
| --------- | ------------------------------------------- |
| `rank`    | Position in leaderboard                     |
| `model`   | Model name                                  |
| `vendor`  | Model creator                               |
| `license` | Open or proprietary                         |
| `score`   | Bradley-Terry ELO rating (higher is better) |
| `ci`      | Confidence interval                         |
| `votes`   | Number of head-to-head comparisons          |

### Strengths and limitations

Chatbot Arena is the most widely cited human-preference benchmark and is
considered the most realistic measure of user-facing chat quality. It depends on
crowd voters and is refreshed periodically (not continuously). There is no
official API — the community mirror is the best machine-readable access. The
code arena specifically measures coding quality through human preference.

Sources: [Arena leaderboard](https://arena.ai/leaderboard),
[community mirror API](https://github.com/oolong-tea-2026/arena-ai-leaderboards),
and [arena-rank methodology](https://github.com/lmarena/arena-rank).

## 9. Aider Polyglot

### Endpoints and access

Aider Polyglot tests LLMs on 225 Exercism coding exercises across C++, Go, Java,
JavaScript, Python, and Rust using the Aider code-editing tool:

- Leaderboard data (YAML):
  `GET https://raw.githubusercontent.com/Aider-AI/aider/main/aider/website/_data/polyglot_leaderboard.yml`.
- Leaderboard website: `https://aider.chat/docs/leaderboards/`.
- GitHub: `https://github.com/Aider-AI/aider`.

Access is unauthenticated. The YAML file is the canonical machine-readable
source.

### Data and meaning

Each leaderboard entry contains:

| Field                       | Meaning                                        |
| --------------------------- | ---------------------------------------------- |
| `model`                     | Model name                                     |
| `pass_rate_2`               | Percent of exercises passing on second attempt |
| `pass_rate_1`               | Percent passing on first attempt               |
| `edit_format`               | Editing mode used (diff, whole, etc.)          |
| `total_cost`                | Total API cost for the benchmark run           |
| `percent_cases_well_formed` | Percent of responses with valid edit format    |
| `test_timeouts`             | Number of test timeouts                        |
| `seconds_per_case`          | Average time per exercise                      |
| `date`                      | Date the benchmark was run                     |
| `versions`                  | Aider version used                             |

### Strengths and limitations

Aider Polyglot measures real multi-language code editing through a tool
interface, which is closer to how models are used in practice than competitive
coding benchmarks. It includes cost data per run. Coverage is limited to models
the Aider team has evaluated, and scores depend on the Aider scaffolding
version.

Sources: [Aider leaderboards](https://aider.chat/docs/leaderboards/) and
[polyglot leaderboard data](https://github.com/Aider-AI/aider/blob/main/aider/website/_data/polyglot_leaderboard.yml).

## 10. Hugging Face Leaderboard API

### Endpoints and access

Hugging Face provides a unified API for querying leaderboard scores across all
official benchmark datasets on the Hub:

- `GET https://huggingface.co/api/datasets/{dataset_id}/leaderboard` — ranked
  model scores for any benchmark dataset.
- `GET https://huggingface.co/api/datasets?filter=benchmark:official` — discover
  all official benchmark datasets.
- Pre-aggregated multi-benchmark dataset:
  `hf://datasets/OpenEvals/leaderboard-data/data/train-00000-of-00001.parquet`.

Public reads are unauthenticated. Gated benchmark datasets require a Hugging
Face token.

### Data and meaning

Each `DatasetLeaderboardEntry` contains:

| Field          | Meaning                                            |
| -------------- | -------------------------------------------------- |
| `rank`         | Position on the leaderboard                        |
| `model_id`     | Full model ID (e.g. `Qwen/Qwen3.5-397B-A17B`)      |
| `value`        | The benchmark score                                |
| `verified`     | Whether the result has been independently verified |
| `author`       | User or Organization object                        |
| `source`       | Where the result was submitted from                |
| `filename`     | Path to the eval results YAML file                 |
| `pull_request` | PR number for the submission                       |
| `notes`        | Optional notes                                     |

The `OpenEvals/leaderboard-data` Parquet file aggregates scores across official
benchmarks into one file with columns like `mmluPro_score`, `gpqa_score`,
`swePro_score`, and others.

### Strengths and limitations

This is the single best programmatic entry point for cross-benchmark model
scores. It covers every official HF benchmark (SWE-bench Verified, MMLU-Pro,
GPQA, and others) through one API shape. The pre-aggregated Parquet is the
fastest way to get a cross-benchmark view without calling multiple endpoints.
Scores depend on who submitted the evaluation and which configuration they used.

Sources:
[Hugging Face leaderboard data guide](https://huggingface.co/docs/hub/leaderboard-data-guide)
and
[OpenEvals/leaderboard-data](https://huggingface.co/datasets/OpenEvals/leaderboard-data).

## Recommended use

Use **Artificial Analysis** for independent model quality and provider
performance. Preserve the evaluation version, provider, prompt preset,
concurrency, date, and measurement window with every value.

Use **BenchLM** for benchmark-composite category scores, overall leaderboard
rank, and headline pricing. Preserve the methodology version, evidence status
(`supported` or `estimated`), and category-level evidence with each score.

Use **SWE-bench Verified** as the primary coding agent benchmark. Use
**SWE-bench-Live** when contamination-free or multi-language coverage matters.

Use **LiveCodeBench** for competitive coding evaluation. Specify the release
version and time window with every score.

Use **GPQA Diamond** for graduate-level science reasoning. Preserve the
evaluator (Epoch AI, Artificial Analysis, etc.) and shot count.

Use **Chatbot Arena** for human-preference quality. Preserve the arena category
(text, code, agent), date, and vote count with every ELO score.

Use **Aider Polyglot** for real-world multi-language code editing. Preserve the
Aider version, edit format, and cost per run.

Use **Hugging Face Leaderboard API** as the unified programmatic entry point
when querying multiple benchmarks. The `OpenEvals/leaderboard-data` Parquet is
the fastest cross-benchmark view.

Use **MMLU-Pro** for a focused knowledge/reasoning benchmark. Preserve the
prompting method (CoT vs direct) and submission source with each score.

## Data-model requirements

A combined registry should not collapse all observations into one model row. At
minimum, retain:

- canonical model identity;
- source and source-specific model identity;
- benchmark name, version, harness, and date;
- score, metric, and any confidence interval;
- prompting method and shot count when reported;
- evaluation date and source URL.

Missing data means unknown. It must not be converted to `false`, zero, or
unlimited.
