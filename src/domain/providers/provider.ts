import type { ProviderRecord } from '../types.ts'
import { normalizeModelKeys } from '../parsers/normalize-model-keys.ts'
import type { Environment } from '../../env-vars.ts'

type ProviderModelRecord = {
  id: number
  name: string
  baseUrl: string
  modelsPath: string | null
  apiKeyEnvVar: string | null
}

export class ProviderModel {
  private record: ProviderModelRecord
  private environment: Environment

  constructor(record: ProviderModelRecord, environment: Environment) {
    this.record = record
    this.environment = environment
  }

  id() {
    return this.record.id
  }

  name() {
    return this.record.name
  }

  baseUrl() {
    return this.record.baseUrl
  }

  modelsUrl() {
    if (this.record.modelsPath === null) {
      return this.buildModelsUrl('/v1/models')
    }
    return this.buildModelsUrl(this.record.modelsPath)
  }

  apiKey() {
    if (!this.record.apiKeyEnvVar) {
      return ''
    }
    return this.environment.value(this.record.apiKeyEnvVar)
  }

  private buildModelsUrl(modelsPath: string) {
    return new URL(modelsPath, this.record.baseUrl).toString()
  }
}

export const providerModel = (
  record: ProviderRecord,
  environment: Environment,
) => {
  return new ProviderModel(
    normalizeModelKeys(record) as ProviderModelRecord,
    environment,
  )
}
