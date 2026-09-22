import { lookupReasoningOption } from './lookup-reasoning-options.ts'

class ProviderReasoning {
  private hasReasoningObject: boolean
  private supportedParameters: string[] | undefined
  private isEmbedding: boolean

  constructor(
    hasReasoningObject: boolean,
    supportedParameters: string[] | undefined,
    isEmbedding: boolean,
  ) {
    this.hasReasoningObject = hasReasoningObject
    this.supportedParameters = supportedParameters
    this.isEmbedding = isEmbedding
  }

  resolve() {
    if (this.hasReasoningObject) {
      return true
    }
    return this.inferredFromEmbeddings()
  }

  private inferredFromEmbeddings() {
    if (this.isEmbedding) {
      return false
    }
    return this.reasoningFromParameters()
  }

  private reasoningFromParameters() {
    if (
      this.supportedParameters === undefined ||
      this.hasReasoningParameters(this.supportedParameters)
    ) {
      return null
    }
    return false
  }

  private hasReasoningParameters(supportedParameters: string[]) {
    return supportedParameters.some(
      (parameter) => lookupReasoningOption(parameter) !== undefined,
    )
  }
}

export const providerReasoning = (
  hasReasoningObject: boolean,
  supportedParameters: string[] | undefined,
  isEmbedding: boolean,
) => {
  return new ProviderReasoning(
    hasReasoningObject,
    supportedParameters,
    isEmbedding,
  ).resolve()
}
