import type { Environment } from '../../env-vars.ts'
import type { ModelInfo, ProviderConfig } from '../../model-info/types.ts'
import { ValidateModel } from './validate-model.ts'

export class FoundModels {
  private models: ModelInfo[]
  private providers: ProviderConfig[]
  private environment: Environment

  constructor(
    models: ModelInfo[],
    providers: ProviderConfig[],
    environment: Environment,
  ) {
    this.models = models
    this.providers = providers
    this.environment = environment
  }

  all() {
    return this.models.filter((model) => this.validate(model))
  }

  first() {
    return this.all()[0]
  }

  private validate(model: ModelInfo) {
    return new ValidateModel(model, this.providers, this.environment).validate()
  }
}
