import { appendRatings } from './ratings/append-ratings.js'
import { defaultCachePath, writeCache } from './cache.js'
import { fetchNousModels } from './providers/nous.js'
import { fetchOllamaModels } from './providers/ollama.js'
import type { ModelRecord } from './types.js'

class GatherModelData {
  private crowDirectory: string
  private records: ModelRecord[] = []

  constructor(crowDirectory: string = process.cwd()) {
    this.crowDirectory = crowDirectory
  }

  async run() {
    this.logStart()
    await this.fetchProviderRecords()
    this.dedupRecords()
    await this.appendRatings()
    this.writeModelRecordsToCache()
    this.logCompletion()
  }

  private logStart() {
    console.log('Fetching model data and building cache...')
  }

  private async fetchProviderRecords() {
    const nousRecords = await fetchNousModels()
    const ollamaRecords = await fetchOllamaModels()

    this.records = [...nousRecords, ...ollamaRecords]
  }

  private dedupRecords() {
    const byId = new Map<string, ModelRecord>()

    this.records.forEach((record) => {
      const existing = byId.get(record.id)
      if (existing === undefined) {
        byId.set(record.id, record)
        return
      }
      byId.set(record.id, this.mergeRecords(existing, record))
    })

    this.records = Array.from(byId.values())
  }

  private mergeRecords(a: ModelRecord, b: ModelRecord): ModelRecord {
    return {
      ...a,
      providers: [...new Set([...a.providers, ...b.providers])],
    }
  }

  private async appendRatings() {
    this.records = await appendRatings(this.records)
  }

  private writeModelRecordsToCache() {
    writeCache(defaultCachePath(this.crowDirectory), this.records)
  }

  private logCompletion() {
    console.log(
      `Wrote ${this.records.length} models to ${defaultCachePath(this.crowDirectory)}`,
    )
  }
}

export const gatherModelData = async (crowDirectory?: string) => {
  const gatherer = new GatherModelData(crowDirectory)
  return gatherer.run()
}
