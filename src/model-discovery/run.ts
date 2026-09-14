#!/usr/bin/env node
/**
 * Build a JSON cache of the models available to you, with real metrics.
 *
 *   crow-code-models --refresh          fetch everything, write .cache/models.json
 *   crow-code-models                    read .cache/models.json (builds it if missing)
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

import { fetchAABenchmarks } from './ratings/aa-benchmarks.js'
import { buildRecords } from './build-records.js'
import { defaultCachePath, readCache, writeCache } from './cache.js'
import { fetchNousModels } from './fetch-nous.js'
import { fetchOllamaModels } from './fetch-ollama.js'
import { filterRecords } from './filter.js'
import { parseArguments } from './parse-args.js'
import { renderJson, renderTable } from './render.js'
import { sortRecords } from './sort.js'
import { CacheFile } from './types.js'

const buildCache = async (): Promise<CacheFile> => {
  console.error('Fetching model data and building cache...')
  const nousModels = await fetchNousModels()
  const ollamaModels = await fetchOllamaModels()
  const catalogIds = new Set<string>([
    ...nousModels.map((model) => model.id),
    ...ollamaModels.map((model) => model.name),
  ])
  const benchmarks = await fetchAABenchmarks(catalogIds)
  const models = buildRecords(nousModels, ollamaModels, benchmarks)
  writeCache(defaultCachePath(), models)
  return {
    fetchedAt: new Date().toISOString(),
    sources: [],
    models,
  }
}

const loadOrBuildCache = async (refresh: boolean): Promise<CacheFile> => {
  if (!refresh) {
    const existing = readCache(defaultCachePath())
    if (existing !== null) {
      return existing
    }
  }
  return buildCache()
}

const main = async () => {
  const options = parseArguments(process.argv.slice(2))
  const cache = await loadOrBuildCache(options.refresh)
  const filtered = filterRecords(cache.models, options)
  const sorted = sortRecords(filtered, options.sort)
  let models = sorted
  if (!options.all) {
    models = sorted.slice(0, options.top)
  }
  if (options.json) {
    renderJson(models)
    return
  }
  renderTable(models, cache)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
