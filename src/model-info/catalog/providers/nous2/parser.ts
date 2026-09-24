import { ReasoningParser } from '../reasoning-parser.ts'
import type {
  CatalogModel,
  Nous2ApiBody,
  Nous2ApiModel,
} from '../../../types.ts'

class NousParser {
  private model: Nous2ApiModel
  private provider: string
  private reasoning: ReasoningParser

  constructor(model: Nous2ApiModel, provider: string) {
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
      costInput: this.toMillionPrice(this.model.pricing.prompt),
      costOutput: this.toMillionPrice(this.model.pricing.completion),
      dynamicDelegation: false,
      modality: this.modality(),
      supportedParameters: this.model.supported_parameters,
      supportsReasoning: this.reasoning.supportsReasoning(),
      canDisableReasoning: this.reasoning.canDisableReasoning(),
      reasoningOptions: this.reasoning.reasoningOptions(),
    }
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

const parseNousRecord = (
  model: Nous2ApiModel,
  provider: string,
): CatalogModel => {
  return new NousParser(model, provider).parseRecord()
}

export const parseNousBody = (
  body: Nous2ApiBody,
  provider: string,
): CatalogModel[] => {
  return body.data.map((model) => parseNousRecord(model, provider))
}
