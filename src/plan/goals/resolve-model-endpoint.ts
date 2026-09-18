import { existsSync } from '@std/fs'
import { getCheapNoReasoningModels } from '../../model-discovery/pick/select-cheap-no-reasoning-models.ts'
import type {
  ModelRecord,
  ProviderConfig,
} from '../../model-discovery/types.ts'
import type { Environment } from '../../env-vars.ts'

class ModelEndpointResolver {
  private providers: ProviderConfig[]
  private environment: Environment

  constructor(providers: ProviderConfig[], environment: Environment) {
    this.providers = providers
    this.environment = environment
  }

  resolve(cachePath: string) {
    const models = getCheapNoReasoningModels(cachePath)
    if (models.length === 0) {
      console.error('No cheap no-reasoning models in the model cache')
      return null
    }
    return this.modelEndpointFor(models[0])
  }

  private modelEndpointFor(model: ModelRecord) {
    const config = this.configFor(model.providers[0])
    if (config === undefined) {
      console.error(`No provider config for ${model.providers[0]}`)
      return null
    }
    return this.buildTarget(config, model.id)
  }

  private buildTarget(
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
  cachePath: string,
  providers: ProviderConfig[],
  environment: Environment,
) => {
  if (!existsSync(cachePath)) {
    console.error(`Model cache not found: ${cachePath}`)
    return null
  }
  const resolver = new ModelEndpointResolver(providers, environment)
  return resolver.resolve(cachePath)
}
