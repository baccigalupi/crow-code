import type {
  CatalogModel,
  DefaultReasoning,
  Ollama2ApiBody,
  Ollama2ApiModel,
} from '../../../types.ts'

class OllamaParser {
  private model: Ollama2ApiModel
  private provider: string

  constructor(model: Ollama2ApiModel, provider: string) {
    this.model = model
    this.provider = provider
  }

  parseRecord(): CatalogModel {
    return {
      id: this.model.name,
      name: this.model.name,
      provider: this.provider,
      contextLength: this.contextLength(),
      costInput: 0,
      costOutput: 0,
      dynamicDelegation: false,
      modality: 'local',
      supportedParameters: [],
      supportsReasoning: this.supportsReasoning(),
      canDisableReasoning: this.canDisableReasoning(),
      reasoningOptions: this.reasoningOptions(),
    }
  }

  private contextLength() {
    return this.model.details.context_length || null
  }

  private supportsReasoning() {
    if (this.model.capabilities === undefined) {
      return false
    }

    return this.model.capabilities.includes('thinking')
  }

  private canDisableReasoning() {
    return this.supportsReasoning()
  }

  private reasoningOptions(): DefaultReasoning {
    if (!this.supportsReasoning()) {
      return {}
    }

    return {
      default_enabled: true,
      supported_efforts: ['low', 'medium', 'high', 'max'],
    }
  }
}

const parseOllamaRecord = (
  model: Ollama2ApiModel,
  provider: string,
): CatalogModel => {
  return new OllamaParser(model, provider).parseRecord()
}

export const parseOllamaBody = (
  body: Ollama2ApiBody,
  provider: string,
): CatalogModel[] => {
  return body.models.map((model) => parseOllamaRecord(model, provider))
}
