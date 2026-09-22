import type {
  NousApiRecord,
  NousModel,
  ProviderConfig,
} from '../../../types.ts'
import { providerReasoning } from '../provider-reasoning.ts'
import { reasoningOptions } from '../reasoning-options.ts'

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
      provider: this.config.name,
      reasoning: providerReasoning(
        model.reasoning !== undefined && model.reasoning !== null,
        model.supported_parameters,
        this.modality(model).endsWith('->embeddings'),
      ),
      reasoningOptions: reasoningOptions(
        model.supported_parameters,
      ),
      costInput: this.toMillionPrice(this.promptPrice(model.pricing)),
      costOutput: this.toMillionPrice(this.completionPrice(model.pricing)),
      contextLength: model.context_length || null,
      modality: this.modality(model),
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
}
