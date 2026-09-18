import { existsSync } from '@std/fs'
import { getCheapNoReasoningModels } from '../../model-discovery/pick/select-cheap-no-reasoning-models.ts'
import type {
  ModelRecord,
  ProviderConfig,
} from '../../model-discovery/types.ts'
import type { Environment } from '../../env-vars.ts'
import type { GoalTarget } from '../types.ts'

class GoalTargetResolver {
  private providers: ProviderConfig[]
  private environment: Environment

  constructor(providers: ProviderConfig[], environment: Environment) {
    this.providers = providers
    this.environment = environment
  }

  resolve(cachePath: string): GoalTarget | null {
    const models = getCheapNoReasoningModels(cachePath)
    if (models.length === 0) {
      console.error('No cheap no-reasoning models in the model cache')
      return null
    }
    return this.targetFor(models[0])
  }

  private targetFor(model: ModelRecord): GoalTarget | null {
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
  ): GoalTarget | null {
    const key = this.apiKey(config)
    if (key === '') {
      console.error(`Missing api key env var ${config.apiKeyEnv}`)
      return null
    }
    return { baseURL: `${config.baseUrl}/v1`, apiKey: key, model }
  }

  private apiKey(config: ProviderConfig): string {
    if (config.apiKeyEnv === undefined) {
      return 'unused'
    }
    return this.environment.value(config.apiKeyEnv)
  }

  private configFor(name: string) {
    return this.providers.find((config) => config.name === name)
  }
}

export const resolveGoalTarget = (
  cachePath: string,
  providers: ProviderConfig[],
  environment: Environment,
): GoalTarget | null => {
  if (!existsSync(cachePath)) {
    console.error(`Model cache not found: ${cachePath}`)
    return null
  }
  const resolver = new GoalTargetResolver(providers, environment)
  return resolver.resolve(cachePath)
}
