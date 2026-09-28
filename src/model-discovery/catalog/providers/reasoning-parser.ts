import type { ReasoningSource } from '../../types.ts'

export class ReasoningParser {
  private model: ReasoningSource

  constructor(model: ReasoningSource) {
    this.model = model
  }

  supportsReasoning() {
    return !this.isEmbedding() &&
      (this.hasReasoning() || this.hasReasoningParameter())
  }

  canDisableReasoning() {
    return this.hasReasoning() && this.reasoningOptions().mandatory !== true
  }

  reasoningOptions() {
    if (this.model.reasoning === undefined) {
      return {}
    }

    return this.model.reasoning
  }

  private hasReasoning() {
    return this.model.reasoning !== undefined
  }

  private isEmbedding() {
    return this.modality().endsWith('->embeddings')
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

  private hasReasoningParameter() {
    const parameters = ['reasoning', 'include_reasoning', 'reasoning_effort']
    return this.model.supported_parameters.some((parameter) =>
      parameters.includes(parameter)
    )
  }
}
