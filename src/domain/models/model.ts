import type { DefaultReasoning } from '../types.ts'
import { Environment } from '../../env-vars.ts'
import type { ModelEndpoint } from '../../model-requests/types.ts'
import type { ModelEntityRow, ModelRow } from '../types.ts'

const emptyModelRow: ModelEntityRow = {
  dynamic_delegation: false,
  supported_parameters: '[]',
  supports_reasoning: false,
  can_disable_reasoning: false,
  reasoning_options: '{}',
}

export class ModelEntity {
  private row: ModelEntityRow
  private environment: Environment

  constructor(row: ModelEntityRow, environment = new Environment({})) {
    this.row = row
    this.environment = environment
  }

  id() {
    return this.row.id
  }

  providerId() {
    return this.row.provider_id
  }

  identifier() {
    return this.row.identifier
  }

  name() {
    return this.row.name
  }

  contextLength() {
    return this.row.context_length
  }

  costInput() {
    return this.row.cost_input
  }

  costOutput() {
    return this.row.cost_output
  }

  dynamicDelegation() {
    return Boolean(this.row.dynamic_delegation)
  }

  modality() {
    return this.row.modality
  }

  supportedParameters(): string[] {
    return JSON.parse(this.row.supported_parameters)
  }

  supportsReasoning() {
    return Boolean(this.row.supports_reasoning)
  }

  canDisableReasoning() {
    return Boolean(this.row.can_disable_reasoning)
  }

  reasoningOptions(): DefaultReasoning {
    return JSON.parse(this.row.reasoning_options)
  }

  endpoint(): ModelEndpoint {
    return {
      baseURL: String(this.row.provider_base_url || ''),
      apiKey: this.providerApiKey(),
      model: String(this.identifier() || ''),
      providerId: Number(this.providerId() || 0),
    }
  }

  private providerApiKey() {
    const name = String(this.row.provider_api_key_env_var || '')
    return this.environment.value(name)
  }
}

export const modelEntity = (row?: ModelRow, environment?: Environment) => {
  if (!row) return new ModelEntity(emptyModelRow, environment)
  return new ModelEntity(row, environment)
}

export const modelEntities = (
  rows: ModelRow[],
  environment?: Environment,
) => rows.map((row) => modelEntity(row, environment))
