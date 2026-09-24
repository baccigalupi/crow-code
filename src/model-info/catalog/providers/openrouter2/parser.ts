import { ReasoningParser } from '../reasoning-parser.ts'
import type {
  CatalogModel,
  OpenRouter2ApiBody,
  OpenRouter2ApiModel,
} from '../../../types.ts'

class OpenRouterParser {
  private model: OpenRouter2ApiModel
  private provider: string
  private reasoning: ReasoningParser

  constructor(model: OpenRouter2ApiModel, provider: string) {
    this.model = model
    this.provider = provider
    this.reasoning = new ReasoningParser(model)
  }

  parseRecord(): CatalogModel {
    return {
      id: this.model.id,
      name: this.model.name,
      provider: this.provider,
      contextLength: this.model.context_length,
      costInput: this.costInput(),
      costOutput: this.costOutput(),
      dynamicDelegation: this.isDynamicDelegation(),
      modality: this.modality(),
      supportedParameters: this.model.supported_parameters,
      supportsReasoning: this.reasoning.supportsReasoning(),
      canDisableReasoning: this.reasoning.canDisableReasoning(),
      reasoningOptions: this.reasoning.reasoningOptions(),
    }
  }

  private isDynamicDelegation() {
    return parseFloat(this.model.pricing.prompt) < 0 ||
      parseFloat(this.model.pricing.completion) < 0
  }

  private costInput() {
    if (this.isDynamicDelegation()) {
      return null
    }

    return this.toMillionPrice(this.model.pricing.prompt)
  }

  private costOutput() {
    if (this.isDynamicDelegation()) {
      return null
    }

    return this.toMillionPrice(this.model.pricing.completion)
  }

  private modality() {
    if (
      this.model.architecture === undefined ||
      this.model.architecture.modality === undefined
    ) {
      return 'unknown'
    }

    return this.model.architecture.modality
  }

  private toMillionPrice(pricePerToken: string) {
    return parseFloat(pricePerToken) * 1_000_000
  }
}

const parseOpenRouterRecord = (
  model: OpenRouter2ApiModel,
  provider: string,
): CatalogModel => {
  return new OpenRouterParser(model, provider).parseRecord()
}

export const parseOpenRouterBody = (
  body: OpenRouter2ApiBody,
  provider: string,
): CatalogModel[] => {
  return body.data.map((model) => parseOpenRouterRecord(model, provider))
}
