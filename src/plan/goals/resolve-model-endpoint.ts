import { existsSync } from '@std/fs'
import { getCheapNoReasoningModels } from '../../model-info/pick/select-cheap-no-reasoning-models.ts'
import type { ModelInfo, ProviderConfig } from '../../model-info/types.ts'
import type { Environment } from '../../env-vars.ts'

class ModelEndpointResolver {
  private providers: ProviderConfig[]
  private environment: Environment

  constructor(providers: ProviderConfig[], environment: Environment) {
    this.providers = providers
    this.environment = environment
  }

  resolve(modelCatalogPath: string) {
    const models = getCheapNoReasoningModels(modelCatalogPath)
    if (models.length === 0) {
      console.error('No cheap no-reasoning models in the model catalog')
      return null
    }
    return this.modelEndpointFor(models[0])
  }

  private modelEndpointFor(model: ModelInfo) {
    const config = this.configFor(model.providers[0])
    if (config === undefined) {
      console.error(`No provider config for ${model.providers[0]}`)
      return null
    }
    return this.buildEndpoint(config, model.id)
  }

  private buildEndpoint(
    config: ProviderConfig,
    model: string,
  ) {
    const key = this.apiKey(config)
    if (key === '') {
      console.error(`Missing api key env var ${config.apiKeyEnv}`)
      return null
    }
    return { baseURL: `${config.baseUrl}/v1`, apiKey: key, model }
  }

  private apiKey(config: ProviderConfig) {
    if (config.apiKeyEnv === undefined) {
      return 'unused'
    }
    return this.environment.value(config.apiKeyEnv)
  }

  private configFor(name: string) {
    return this.providers.find((config) => config.name === name)
  }
}

export const resolveModelEndpoint = (
  modelCatalogPath: string,
  providers: ProviderConfig[],
  environment: Environment,
) => {
  if (!existsSync(modelCatalogPath)) {
    console.error(`Model catalog not found: ${modelCatalogPath}`)
    return null
  }
  const resolver = new ModelEndpointResolver(providers, environment)
  return resolver.resolve(modelCatalogPath)
}
