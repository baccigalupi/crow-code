import type {
  OllamaApiRecord,
  OllamaModel,
  ProviderConfig,
} from '../../types.ts'

export class OllamaParser {
  private config: ProviderConfig

  constructor(config: ProviderConfig) {
    this.config = config
  }

  parseResponse(raw: OllamaApiRecord) {
    if (raw.models === undefined) {
      return []
    }
    return raw.models.map((model) => this.buildRecord(model))
  }

  private buildRecord(model: OllamaModel) {
    return {
      id: model.name,
      name: model.name,
      provider: this.config.name,
      reasoning: null,
      reasoningOptions: [],
      intelligence: null,
      coding: null,
      agentic: null,
      costInput: 0,
      costOutput: 0,
      contextLength: this.contextLength(model.details),
      modality: 'local',
      knowledgeCutoff: null,
      size: this.size(model.details),
    }
  }

  private contextLength(details: OllamaModel['details']) {
    if (details === undefined) {
      return null
    }
    return details.context_length || null
  }

  private size(details: OllamaModel['details']) {
    if (details === undefined || details.parameter_size === undefined) {
      return ''
    }
    return details.parameter_size
  }
}
