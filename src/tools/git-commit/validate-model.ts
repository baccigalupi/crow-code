import type { Environment } from '../../env-vars.ts'
import type { ModelInfo, ProviderConfig } from '../../model-info/types.ts'

export class ValidateModel {
  private model: ModelInfo
  private providers: ProviderConfig[]
  private environment: Environment

  constructor(
    model: ModelInfo,
    providers: ProviderConfig[],
    environment: Environment,
  ) {
    this.model = model
    this.providers = providers
    this.environment = environment
  }

  validate() {
    return this.hasProvider() &&
      this.hasApiKeyEnvironment() &&
      this.hasApiKey()
  }

  private hasProvider() {
    return this.findProvider() !== undefined
  }

  private hasApiKeyEnvironment() {
    return this.provider().apiKeyEnv !== undefined
  }

  private hasApiKey() {
    return this.environment.hasValue(this.apiKeyEnvironment())
  }

  private findProvider() {
    return this.providers.find(({ name }) => name === this.model.provider)
  }

  private provider() {
    return this.findProvider() as ProviderConfig
  }

  private apiKeyEnvironment() {
    return this.provider().apiKeyEnv as string
  }
}
