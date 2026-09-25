import type { Environment } from '../../env-vars.ts'
import { loadProviderConfig } from '../../model-info/catalog/providers/load-provider-config.ts'
import type { ModelInfo, ProviderConfig } from '../../model-info/types.ts'

export class FoundModels {
  private models: ModelInfo[]
  private providers: ProviderConfig[]
  private environment: Environment

  constructor(
    models: ModelInfo[],
    crowDirectory: string,
    environment: Environment,
  ) {
    this.models = models
    this.providers = this.loadProviders(crowDirectory)
    this.environment = environment
  }

  all() {
    return this.models
  }

  first() {
    return this.all()[0]
  }

  firstEndpoint() {
    const model = this.first()
    if (model === undefined) {
      return this.emptyEndpoint()
    }

    const provider = this.provider(model)
    if (provider === undefined) {
      return this.emptyEndpoint()
    }

    return this.endpoint(model, provider)
  }

  private loadProviders(crowDirectory: string) {
    try {
      return loadProviderConfig(crowDirectory)
    } catch {
      return []
    }
  }

  private emptyEndpoint() {
    return { baseURL: '', apiKey: '', model: '' }
  }

  private endpoint(model: ModelInfo, provider: ProviderConfig) {
    const apiKey = this.apiKey(provider)
    return { baseURL: `${provider.baseUrl}/v1`, apiKey, model: model.id }
  }

  private apiKey(provider: ProviderConfig) {
    if (provider.apiKeyEnv === undefined) return ''
    return this.environment.value(provider.apiKeyEnv)
  }

  private provider(model: ModelInfo) {
    return this.providers.find(({ name }) => name === model.provider)
  }
}
