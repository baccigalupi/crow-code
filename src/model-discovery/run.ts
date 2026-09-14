#!/usr/bin/env node
/**
 * Build a JSON cache of the models available to you, with real metrics.
 *
 *   crow-code-models --refresh          fetch everything, write .crow/models.json
 *   crow-code-models                    read .crow/models.json (builds it if missing)
 *   crow-code-models --filter qwen      search the cache by id/name substring
 *   crow-code-models --sort cost        sort (coding, reasoning, agentic, cost, context)
 *   crow-code-models --provider ollama  filter to one provider
 *   crow-code-models --json             dump the raw JSON (pipe to jq)
 *   crow-code-models --top 10           limit rows
 *
 * Every metric is a raw, searchable field — there is no composite or summary
 * score. Sources:
 *   - reasoning / coding / agentic  → Artificial Analysis indices (0-100)
 *   - coding (fallback)             → Aider polyglot pass-rate (%)
 *   - cost, context, modality, reasoning mode → Nous / Ollama catalog
 */

import { main } from './app.js'

main(process.argv.slice(2)).catch((error) => {
  console.error(error)
  process.exitCode = 1
})
