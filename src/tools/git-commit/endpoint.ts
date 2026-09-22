import { join } from '@std/path'
import { Environment, loadEnvironmentalVariables } from '../../env-vars.ts'
import { loadProviderConfig } from '../../model-info/catalog/providers/load-provider-config.ts'
import { getCheapNoReasoningModels } from '../../model-info/pick/select-cheap-no-reasoning-models.ts'
import type {
  Logger,
  ModelInfo,
  ProviderConfig,
} from '../../model-info/types.ts'
import type { ModelEndpointDetails } from '../../plan/types.ts'
import { FoundModels } from './found-models.ts'

class ModelEndpointResolver {
  private crowDirectory: string
  private logger: Logger
  private providers: ProviderConfig[] = []
  private environment = new Environment({})

  constructor(crowDirectory: string, logger: Logger) {
    this.crowDirectory = crowDirectory
    this.logger = logger
  }

  resolve(): ModelEndpointDetails {
    try {
      this.loadConfiguration()
      return this.resolveModel(this.foundModels().first())
    } catch {
      return this.fail('Commit summary configuration could not be loaded')
    }
  }

  private loadConfiguration() {
    this.providers = loadProviderConfig(this.crowDirectory)
    this.environment = loadEnvironmentalVariables()
  }

  private foundModels() {
    return new FoundModels(
      this.loadModels(),
      this.providers,
      this.environment,
    )
  }

  private loadModels() {
    const path = join(this.crowDirectory, 'models.json')
    return getCheapNoReasoningModels(path, 5)
  }

  private resolveModel(model: ModelInfo | undefined) {
    if (model === undefined) return this.failUnavailable()
    return this.endpointFor(model)
  }

  private endpointFor(model: ModelInfo) {
    const provider = this.providerFor(model)
    const apiKey = this.environment.value(provider.apiKeyEnv as string)
    return { baseURL: provider.baseUrl, apiKey, model: model.id }
  }

  private providerFor(model: ModelInfo) {
    return this.providers.find(({ name }) =>
      name === model.provider
    ) as ProviderConfig
  }

  private failUnavailable() {
    return this.fail(
      'No commit summary model has an available provider or API key',
    )
  }

  private fail(message: string) {
    this.logger.error(message)
    return { baseURL: '', apiKey: '', model: '' }
  }
}

export const resolveModelEndpoint = (
  crowDirectory: string,
  logger: Logger,
): ModelEndpointDetails => {
  return new ModelEndpointResolver(crowDirectory, logger).resolve()
}
