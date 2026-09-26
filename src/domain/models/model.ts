import type { DefaultReasoning } from '../../types.ts'
import type { ModelRow } from '../types.ts'

type ModelEntityRow =
  & Partial<ModelRow>
  & Pick<
    ModelRow,
    | 'dynamic_delegation'
    | 'supported_parameters'
    | 'supports_reasoning'
    | 'can_disable_reasoning'
    | 'reasoning_options'
  >

const emptyModelRow: ModelEntityRow = {
  dynamic_delegation: 0,
  supported_parameters: '[]',
  supports_reasoning: 0,
  can_disable_reasoning: 0,
  reasoning_options: '{}',
}

export class ModelEntity {
  private row: ModelEntityRow

  constructor(row: ModelEntityRow) {
    this.row = row
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
}

export const modelEntity = (row?: ModelRow) => {
  if (!row) return new ModelEntity(emptyModelRow)
  return new ModelEntity(row)
}
