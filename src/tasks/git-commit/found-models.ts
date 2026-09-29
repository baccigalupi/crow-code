import type { ModelEntity } from '../../domain/models/model.ts'
import type { ProviderEntity } from '../../domain/providers/entity.ts'
import type { ModelEndpoint } from '../../model-requests/types.ts'

export class FoundModels {
  private models: ModelEntity[]
  private providers: ProviderEntity[]

  constructor(models: ModelEntity[], providers: ProviderEntity[]) {
    this.models = models
    this.providers = providers
  }

  all() {
    return this.models
  }

  first() {
    return this.all()[0]
  }

  firstEndpoint(): ModelEndpoint {
    if (this.first() === undefined) return this.emptyEndpoint()
    const model = this.first() as ModelEntity
    return this.endpointFor(model)
  }

  private endpointFor(model: ModelEntity) {
    if (this.provider(model) === undefined) return this.emptyEndpoint()
    const provider = this.provider(model) as ProviderEntity
    return this.endpoint(model, provider)
  }

  private emptyEndpoint() {
    return { baseURL: '', apiKey: '', model: '' }
  }

  private endpoint(model: ModelEntity, provider: ProviderEntity) {
    return {
      baseURL: `${provider.baseUrl()}/v1`,
      apiKey: provider.apiKey(),
      model: model.identifier() as string,
    }
  }

  private provider(model: ModelEntity) {
    return this.providers.find((provider) =>
      provider.id() === model.providerId()
    )
  }
}
