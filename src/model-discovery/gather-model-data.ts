import { fetchAABenchmarks } from './ratings/aa-benchmarks.js'
import { buildRecords } from './build-records.js'
import { defaultCachePath, writeCache } from './cache.js'
import { fetchNousModels } from './providers/nous.js'
import { fetchOllamaModels } from './providers/ollama.js'

export const gatherModelData = async (crowDirectory = process.cwd()) => {
  console.log('Fetching model data and building cache...')
  const nousRecords = await fetchNousModels()
  const ollamaRecords = await fetchOllamaModels()
  const catalogIds = new Set<string>([
    ...nousRecords.map((record) => record.id),
    ...ollamaRecords.map((record) => record.id),
  ])
  const benchmarks = await fetchAABenchmarks(catalogIds)
  const models = buildRecords(nousRecords, ollamaRecords, benchmarks)
  writeCache(defaultCachePath(crowDirectory), models)
  console.log(
    `Wrote ${models.length} models to ${defaultCachePath(crowDirectory)}`,
  )
}
