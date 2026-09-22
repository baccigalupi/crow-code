import type {
  CatalogModel,
  Nous2ApiBody,
  Nous2ApiModel,
  NousReasoningOptions,
} from '../types.ts'

class NousParser {
  private model: Nous2ApiModel

  constructor(model: Nous2ApiModel) {
    this.model = model
  }

  parseRecord(): CatalogModel {
    return {
      id: this.model.id,
      name: this.model.name,
      contextLength: this.model.context_length,
      costInput: this.toMillionPrice(this.model.pricing.prompt),
      costOutput: this.toMillionPrice(this.model.pricing.completion),
      modality: this.modality(),
      supportedParameters: this.model.supported_parameters,
      supportsReasoning: this.supportsReasoning(),
      canDisableReasoning: this.canDisableReasoning(),
      reasoningOptions: this.reasoningOptions(),
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

  private supportsReasoning() {
    return this.model.reasoning !== undefined
  }

  private canDisableReasoning() {
    if (
      this.model.reasoning === undefined ||
      this.model.reasoning.mandatory === true
    ) {
      return false
    }

    return true
  }

  private reasoningOptions(): NousReasoningOptions {
    if (this.model.reasoning === undefined) {
      return {}
    }

    return this.model.reasoning
  }

  private toMillionPrice(pricePerToken: string) {
    return parseFloat(pricePerToken) * 1_000_000
  }
}

const parseNousRecord = (model: Nous2ApiModel): CatalogModel => {
  return new NousParser(model).parseRecord()
}

export const parseNousBody = (body: Nous2ApiBody): CatalogModel[] => {
  return body.data.map(parseNousRecord)
}
