import { loadProviderConfig } from './providers/load-provider-config.ts'
import { fetchProviders } from './providers/fetch-providers.ts'
import { appendRatings } from './ratings/append-ratings.ts'
import { defaultModelCatalogPath, writeModelCatalog } from './model-catalog.ts'
import { type Environment, loadEnvironmentalVariables } from '../env-vars.ts'
import type { ModelInfo } from './types.ts'

class BuildModelCatalog {
  private crowDirectory: string
  private environment: Environment
  private fetchClient: typeof fetch
  private records: ModelInfo[] = []

  constructor(
    crowDirectory: string,
    environment: Environment = loadEnvironmentalVariables(),
    fetchClient: typeof fetch = fetch,
  ) {
    this.crowDirectory = crowDirectory
    this.environment = environment
    this.fetchClient = fetchClient
  }

  async run() {
    this.logStart()
    await this.fetchProviders()
    this.dedupRecords()
    await this.appendRatings()
    this.persistModelCatalog()
    this.logCompletion()
  }

  private logStart() {
    console.log('Fetching model data and building model catalog...')
  }

  private async fetchProviders() {
    const configs = loadProviderConfig(this.crowDirectory)

    this.records = (
      await Promise.all(
        configs.map((config) => fetchProviders(config, this.fetchClient)),
      )
    ).flat()
  }

  private dedupRecords() {
    const byId = new Map<string, ModelInfo>()

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

  private mergeRecords(a: ModelInfo, b: ModelInfo): ModelInfo {
    return {
      ...a,
      providers: [...new Set([...a.providers, ...b.providers])],
    }
  }

  private async appendRatings() {
    this.records = await appendRatings(
      this.records,
      this.environment,
      this.fetchClient,
    )
  }

  private persistModelCatalog() {
    writeModelCatalog(
      defaultModelCatalogPath(this.crowDirectory),
      this.records,
    )
  }

  private logCompletion() {
    console.log(
      `Wrote ${this.records.length} models to ${
        defaultModelCatalogPath(
          this.crowDirectory,
        )
      }`,
    )
  }
}

export const buildModelCatalog = async (
  crowDirectory: string,
  environment: Environment = loadEnvironmentalVariables(),
  fetchClient: typeof fetch = fetch,
) => {
  const builder = new BuildModelCatalog(crowDirectory, environment, fetchClient)
  return await builder.run()
}
