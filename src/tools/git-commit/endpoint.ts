import { join } from '@std/path'
import { loadProviderConfig } from '../../model-info/catalog/providers/load-provider-config.ts'
import { getCheapNoReasoningModels } from '../../model-info/pick/select-cheap-no-reasoning-models.ts'
import type {
  Logger,
  ModelInfo,
  ProviderConfig,
} from '../../model-info/types.ts'
import type { ModelEndpointDetails } from '../../plan/types.ts'

const emptyEndpoint = { baseURL: '', apiKey: '', model: '' }
class CommitSummaryEndpoint {
  private crowDirectory: string
  private logger: Logger
  private modelId = ''
  private providerName = ''
  private baseURL = ''
  private apiKeyEnvironment: string | undefined
  private apiKey = ''
  constructor(crowDirectory: string, logger: Logger) {
    this.crowDirectory = crowDirectory
    this.logger = logger
  }
  resolve() {
    if (!this.configure()) return emptyEndpoint
    return { baseURL: this.baseURL, apiKey: this.apiKey, model: this.modelId }
  }

  private configure() {
    try {
      return this.loadModel() && this.loadProvider() && this.loadApiKey()
    } catch {
      this.logger.error('Commit summary configuration could not be loaded')
      return false
    }
  }

  private loadModel() {
    const path = join(this.crowDirectory, 'models.json')
    return this.selectModel(getCheapNoReasoningModels(path))
  }

  private selectModel(models: ModelInfo[]) {
    if (models.length === 0) {
      return this.fail('No commit summary model is available')
    }
    this.modelId = models[0].id
    this.providerName = models[0].provider
    return true
  }

  private loadProvider() {
    const providers = loadProviderConfig(this.crowDirectory)
    return this.selectProvider(providers.find(this.matchesProvider.bind(this)))
  }

  private matchesProvider(provider: ProviderConfig) {
    return provider.name === this.providerName
  }

  private selectProvider(provider: ProviderConfig | undefined) {
    if (provider === undefined) {
      return this.fail('No provider is available for the commit summary model')
    }
    this.baseURL = provider.baseUrl
    this.apiKeyEnvironment = provider.apiKeyEnv
    return true
  }

  private loadApiKey() {
    if (this.apiKeyEnvironment === undefined) {
      return this.fail(
        'No API key is configured for the commit summary provider',
      )
    }
    return this.selectApiKey(Deno.env.get(this.apiKeyEnvironment))
  }

  private selectApiKey(apiKey: string | undefined) {
    if (apiKey === undefined) {
      return this.fail('The commit summary API key is unavailable')
    }
    this.apiKey = apiKey
    return true
  }

  private fail(message: string) {
    this.logger.error(message)
    return false
  }
}

export const resolveModelEndpoint = (
  crowDirectory: string,
  logger: Logger,
): ModelEndpointDetails => {
  return new CommitSummaryEndpoint(crowDirectory, logger).resolve()
}
export const isModelEndpointAvailable = (endpoint: ModelEndpointDetails) =>
  endpoint.baseURL.length > 0
