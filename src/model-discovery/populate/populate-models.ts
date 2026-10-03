import type { ApplicationData } from '../../application-data.ts'
import { providerFindAll } from '../../domain/providers/find-all.ts'
import type { ProviderEntity } from '../../domain/providers/entity.ts'
import { getNousModels } from './nous/get-nous-models.ts'
import { getOllamaModels } from './ollama/get-ollama-models.ts'
import { getOpenRouterModels } from './openrouter/get-openrouter-models.ts'
import type { CatalogModel } from '../types.ts'

type ProviderModelsGetter = (
  provider: ProviderEntity,
  applicationData: ApplicationData,
) => Promise<CatalogModel[]>

const providerGetters: ReadonlyMap<string, ProviderModelsGetter> = new Map([
  ['nous', getNousModels],
  ['ollama', getOllamaModels],
  ['openrouter', getOpenRouterModels],
])

class PopulateModels {
  private applicationData: ApplicationData

  constructor(applicationData: ApplicationData) {
    this.applicationData = applicationData
  }

  async run() {
    const providers = await this.findAllProviders()
    const results = await Promise.all(providers.map((p) => this.getModels(p)))
    return results.flat()
  }

  private async findAllProviders() {
    return await providerFindAll(this.applicationData).all()
  }

  private getModels(provider: ProviderEntity) {
    if (!providerGetters.has(provider.name())) {
      return this.skipProvider(provider.name())
    }
    const getter = providerGetters.get(provider.name())!
    return getter(provider, this.applicationData)
  }

  private skipProvider(name: string) {
    this.applicationData.logger().info(
      `Skipping provider "${name}" (no model getter registered)`,
    )
    return Promise.resolve([])
  }
}

export const populateModels = async (applicationData: ApplicationData) =>
  await new PopulateModels(applicationData).run()
