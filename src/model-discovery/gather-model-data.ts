import { fetchAABenchmarks } from './ratings/aa-benchmarks.js'
import { buildRecords } from './build-records.js'
import { defaultCachePath, writeCache } from './cache.js'
import { fetchNousModels } from './providers/nous.js'
import { fetchOllamaModels } from './providers/ollama.js'
import type { ModelRecord, AABenchmarks } from './types.js'

class GatherModelData {
  private crowDirectory: string

  constructor(crowDirectory: string = process.cwd()) {
    this.crowDirectory = crowDirectory
  }

  async run() {
    this.logStart()
    const records = await this.fetchNousAndOllamaRecords()
    const modelRecords = await this.buildRecordsWithBenchmarks(records)
    this.writeModelRecordsToCache(modelRecords)
    this.logCompletion(modelRecords)
  }

  private logStart() {
    console.log('Fetching model data and building cache...')
  }

  private async fetchNousAndOllamaRecords() {
    const nousRecords = await fetchNousModels()
    const ollamaRecords = await fetchOllamaModels()

    return { nousRecords, ollamaRecords }
  }

  private async buildRecordsWithBenchmarks(
    records: { nousRecords: ModelRecord[]; ollamaRecords: ModelRecord[] },
  ) {
    const catalogIds = this.buildCatalogIdSet(records.nousRecords, records.ollamaRecords)
    const benchmarks = await fetchAABenchmarks(catalogIds)

    return buildRecords(records.nousRecords, records.ollamaRecords, benchmarks)
  }

  private writeModelRecordsToCache(modelRecords: ModelRecord[]) {
    writeCache(defaultCachePath(this.crowDirectory), modelRecords)
  }

  private logCompletion(modelRecords: ModelRecord[]) {
    console.log(
      `Wrote ${modelRecords.length} models to ${defaultCachePath(this.crowDirectory)}`,
    )
  }

  private buildCatalogIdSet(
    nousRecords: ModelRecord[],
    ollamaRecords: ModelRecord[],
  ) {
    const ids = new Set<string>()

    for (const record of nousRecords) {
      ids.add(record.id)
    }
    for (const record of ollamaRecords) {
      ids.add(record.id)
    }

    return ids
  }
}

export const gatherModelData = async (crowDirectory?: string) => {
  const gatherer = new GatherModelData(crowDirectory)
  return gatherer.run()
}
