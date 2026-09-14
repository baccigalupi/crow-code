import { fetchAABenchmarks } from './ratings/aa-benchmarks.js'
import { buildRecords } from './build-records.js'
import { defaultCachePath, readCache, writeCache } from './cache.js'
import { fetchCatalog } from './fetch-catalog.js'
import { nousTimeoutMs, nousUrl, parseNousResponse } from './providers/nous.js'
import {
  ollamaTimeoutMs,
  ollamaUrl,
  parseOllamaResponse,
} from './providers/ollama.js'
import { CacheFile } from './types.js'

const buildCache = async (): Promise<CacheFile> => {
  console.error('Fetching model data and building cache...')
  const nousRecords = await fetchCatalog(
    nousUrl,
    parseNousResponse,
    nousTimeoutMs,
  )
  const ollamaRecords = await fetchCatalog(
    ollamaUrl,
    parseOllamaResponse,
    ollamaTimeoutMs,
  )
  const catalogIds = new Set<string>([
    ...nousRecords.map((record) => record.id),
    ...ollamaRecords.map((record) => record.id),
  ])
  const benchmarks = await fetchAABenchmarks(catalogIds)
  const models = buildRecords(nousRecords, ollamaRecords, benchmarks)
  writeCache(defaultCachePath(), models)
  console.log(`Wrote ${models.length} models to ${defaultCachePath()}`)
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

export const main = async (refresh: boolean) => {
  await loadOrBuildCache(refresh)
}
