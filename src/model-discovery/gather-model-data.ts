import { loadProviderConfig } from './providers/load-provider-config.ts'
import { fetchProviders } from './providers/fetch-providers.ts'
import { appendRatings } from './ratings/append-ratings.ts'
import { defaultCachePath, writeCache } from './cache.ts'
import type { ModelRecord } from './types.ts'

class GatherModelData {
  private crowDirectory: string
  private records: ModelRecord[] = []

  constructor(crowDirectory: string = Deno.cwd()) {
    this.crowDirectory = crowDirectory
  }

  async run() {
    this.logStart()
    await this.fetchProviders()
    this.dedupRecords()
    await this.appendRatings()
    this.writeModelRecordsToCache()
    this.logCompletion()
  }

  private logStart() {
    console.log('Fetching model data and building cache...')
  }

  private async fetchProviders() {
    const configs = loadProviderConfig(this.crowDirectory)

    this.records = (
      await Promise.all(configs.map((config) => fetchProviders(config)))
    ).flat()
  }

  private dedupRecords() {
    const byId = new Map<string, ModelRecord>()

    for (const record of this.records) {
      const existing = byId.get(record.id)
      if (existing === undefined) {
        byId.set(record.id, record)
      } else {
        byId.set(record.id, this.mergeRecords(existing, record))
      }
    }

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
