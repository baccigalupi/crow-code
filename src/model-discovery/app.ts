import { fetchAABenchmarks } from './ratings/aa-benchmarks.js'
import { buildRecords } from './build-records.js'
import { defaultCachePath, readCache, writeCache } from './cache.js'
import { fetchNousModels } from './fetch-nous.js'
import { fetchOllamaModels } from './fetch-ollama.js'
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
