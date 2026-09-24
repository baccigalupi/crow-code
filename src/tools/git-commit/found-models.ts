import type { Environment } from '../../env-vars.ts'
import { loadProviderConfig } from '../../model-info/catalog/providers/load-provider-config.ts'
import type { ModelInfo, ProviderConfig } from '../../model-info/types.ts'
import { ValidateModel } from './validate-model.ts'

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
    return this.models.filter((model) => this.validate(model))
  }

  first() {
    return this.all()[0]
  }

  firstEndpoint() {
    if (this.all().length === 0) {
      return this.emptyEndpoint()
    }

    return this.endpoint(this.first())
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

  private endpoint(model: ModelInfo) {
    const provider = this.provider(model)
    const apiKey = this.environment.value(provider.apiKeyEnv as string)
    return { baseURL: provider.baseUrl, apiKey, model: model.id }
  }

  private provider(model: ModelInfo) {
    return this.providers.find(({ name }) =>
      name === model.provider
    ) as ProviderConfig
  }

  private validate(model: ModelInfo) {
    return new ValidateModel(model, this.providers, this.environment).validate()
  }
}
