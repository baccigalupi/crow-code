import { join } from '@std/path'
import type { Environment } from '../../env-vars.ts'
import { getCheapNoReasoningModels } from '../../model-info/pick/select-cheap-no-reasoning-models.ts'
import { FoundModels } from './found-models.ts'

class EndpointInfo {
  private crowDirectory: string
  private environment: Environment

  constructor(crowDirectory: string, environment: Environment) {
    this.crowDirectory = crowDirectory
    this.environment = environment
  }

  isAvailable() {
    return this.foundModels().firstEndpoint().baseURL !== ''
  }

  value() {
    return this.foundModels().firstEndpoint()
  }

  private foundModels() {
    return new FoundModels(
      this.loadModels(),
      this.crowDirectory,
      this.environment,
    )
  }

  private loadModels() {
    try {
      return getCheapNoReasoningModels(
        join(this.crowDirectory, 'models.json'),
        5,
      )
    } catch {
      return []
    }
  }
}

export const modelEndpointInfo = (
  crowDirectory: string,
  environment: Environment,
) => {
  return new EndpointInfo(crowDirectory, environment)
}
