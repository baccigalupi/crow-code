import { join } from '@std/path'
import { getCheapNoReasoningModels } from '../../model-info/pick/select-cheap-no-reasoning-models.ts'
import { FoundModels } from './found-models.ts'

class EndpointInfo {
  private crowDirectory: string

  constructor(crowDirectory: string) {
    this.crowDirectory = crowDirectory
  }

  isAvailable() {
    return this.foundModels().all().length > 0
  }

  value() {
    return this.foundModels().firstEndpoint()
  }

  private foundModels() {
    return new FoundModels(this.loadModels(), this.crowDirectory)
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

export const modelEndpointInfo = (crowDirectory: string) => {
  return new EndpointInfo(crowDirectory)
}
