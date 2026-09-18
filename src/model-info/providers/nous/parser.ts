import type {
  NousApiRecord,
  NousModel,
  ProviderConfig,
  ReasoningMeta,
} from '../../types.ts'

export class NousParser {
  private config: ProviderConfig

  constructor(config: ProviderConfig) {
    this.config = config
  }

  parseResponse(raw: NousApiRecord) {
    if (raw.data === undefined) {
      return []
    }
    return raw.data.map((model) => this.buildRecord(model))
  }

  private buildRecord(model: NousModel) {
    return {
      id: model.id,
      name: this.modelName(model),
      providers: [this.config.name],
      reasoning: null,
      coding: null,
      codingSource: null,
      agentic: null,
      costInput: this.toMillionPrice(this.promptPrice(model.pricing)),
      costOutput: this.toMillionPrice(this.completionPrice(model.pricing)),
      contextLength: model.context_length || null,
      modality: this.modality(model),
      reasoningMode: this.reasoningMode(model.reasoning),
      knowledgeCutoff: model.knowledge_cutoff || null,
      size: '',
    }
  }

  private modelName(model: NousModel) {
    if (model.name === undefined) {
      return model.id
    }
    return model.name
  }

  private modality(model: NousModel) {
    if (
      model.architecture === undefined ||
      model.architecture.modality === undefined
    ) {
      return '-'
    }
    return model.architecture.modality
  }

  private promptPrice(pricing: NousModel['pricing']) {
    if (pricing === undefined) {
      return undefined
    }
    return pricing.prompt
  }

  private completionPrice(pricing: NousModel['pricing']) {
    if (pricing === undefined) {
      return undefined
    }
    return pricing.completion
  }

  private toMillionPrice(pricePerToken: string | undefined) {
    if (pricePerToken === undefined) {
      return 0
    }
    return parseFloat(pricePerToken) * 1_000_000
  }

  private reasoningModeLabel(meta: ReasoningMeta) {
    if (meta.mandatory === true) {
      return 'forced'
    }
    if (meta.default_enabled === true) {
      return 'on'
    }
    return 'off'
  }

  private reasoningMode(meta: ReasoningMeta | null | undefined) {
    if (meta === null || meta === undefined) {
      return '-'
    }
    const mode = this.reasoningModeLabel(meta)
    if (meta.default_effort === undefined) {
      return mode
    }
    return `${mode}/${meta.default_effort}`
  }
}
