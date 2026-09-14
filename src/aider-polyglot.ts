/**
 * Real coding benchmark scores from the Aider polyglot leaderboard
 * (https://aider.chat/docs/leaderboards/), 2025 snapshot.
 *
 * Percent correct = pass rate on 225 Exercism exercises across C++, Go,
 * Java, JavaScript, Python, and Rust, after two attempts.
 *
 * Keys are current Nous/OpenRouter catalog IDs, hand-mapped from the
 * leaderboard's `aider --model` slugs. Where the tested snapshot does not
 * correspond to a currently-listed model, there is no entry (shown as n/a).
 */

export const aiderPolyglotPct: Record<string, number> = {
  // OpenAI
  'openai/gpt-5': 88.0,
  'openai/o3-pro': 84.9,
  'openai/o3': 81.3,
  'openai/o4-mini': 72.0,
  'openai/o1': 61.7,
  'openai/o3-mini': 60.4,
  'openai/gpt-4.1': 52.4,
  'openai/gpt-4o': 45.3, // via chatgpt-4o-latest snapshot
  'openai/gpt-oss-120b': 41.8,
  'openai/gpt-4.1-mini': 32.4,
  'openai/gpt-4o-2024-08-06': 23.1,
  'openai/gpt-4o-2024-11-20': 18.2,
  'openai/gpt-4.1-nano': 8.9,
  'openai/gpt-4o-mini-2024-07-18': 3.6,

  // Google
  'google/gemini-2.5-pro': 83.1,
  'google/gemini-2.5-pro-preview-05-06': 76.9,
  'google/gemini-2.5-pro-preview': 72.9,
  'google/gemini-2.5-flash': 55.1,
  'google/gemma-3-27b-it': 4.9,

  // xAI
  'x-ai/grok-4.3': 79.6, // tested as grok-4 (high)

  // DeepSeek
  'deepseek/deepseek-r1': 74.2, // tested as deepseek-reasoner
  'deepseek/deepseek-chat': 70.2,

  // Anthropic
  'anthropic/claude-opus-4': 72.0, // tested as claude-opus-4-20250514
  'anthropic/claude-sonnet-4': 61.3, // tested as claude-sonnet-4-20250514

  // Qwen
  'qwen/qwen3-235b-a22b': 59.6,
  'qwen/qwen3-32b': 40.0,

  // Kimi / Moonshot
  'moonshotai/kimi-k2': 59.1,

  // Meta
  'meta-llama/llama-4-maverick': 15.6,

  // Cohere
  'cohere/command-a': 12.0,

  // Mistral
  'mistralai/codestral-2508': 11.1,
}

/** Human-readable source attribution. */
export const aiderSource =
  'Aider polyglot leaderboard (aider.chat), 2025 snapshot — 225 Exercism exercises, pass@2'
