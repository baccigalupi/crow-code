import type {
  OpenRouterApiRecord,
  OpenRouterModel,
  ProviderConfig,
} from '../../../types.ts'
import { providerReasoning } from '../provider-reasoning.ts'
import { reasoningOptions } from '../reasoning-options.ts'

export class OpenRouterParser {
  private config: ProviderConfig

  constructor(config: ProviderConfig) {
    this.config = config
  }

  parseResponse(raw: OpenRouterApiRecord) {
    if (raw.data === undefined) {
      return []
    }
    return raw.data.map((model) => this.buildRecord(model))
  }

  private buildRecord(model: OpenRouterModel) {
    return {
      id: model.id,
      name: this.modelName(model),
      provider: this.config.name,
      reasoning: providerReasoning(
        false,
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
      knowledgeCutoff: null,
      size: '',
    }
  }

  private modelName(model: OpenRouterModel) {
    if (model.name === undefined) {
      return model.id
    }
    return model.name
  }

  private modality(model: OpenRouterModel) {
    if (
      model.architecture === undefined ||
      model.architecture.modality === undefined
    ) {
      return '-'
    }
    return model.architecture.modality
  }

  private promptPrice(pricing: OpenRouterModel['pricing']) {
    if (pricing === undefined) {
      return undefined
    }
    return pricing.prompt
  }

  private completionPrice(pricing: OpenRouterModel['pricing']) {
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
