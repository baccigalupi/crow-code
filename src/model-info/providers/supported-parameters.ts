import type { ReasoningControl } from '../types.ts'

const parameterControls: Record<string, ReasoningControl> = {
  reasoning: 'toggle',
  include_reasoning: 'toggle',
  reasoning_effort: 'effort',
}

const hasReasoningParameters = (parameters: string[]) => {
  return parameters.some((parameter) => parameter in parameterControls)
}

const controlFor = (parameter: string): ReasoningControl | undefined => {
  return parameterControls[parameter]
}

export const supportedParametersControls = (
  parameters: string[] | undefined,
): ReasoningControl[] => {
  if (parameters === undefined) {
    return []
  }
  const controls = parameters
    .map(controlFor)
    .filter((control) => control !== undefined)
  return [...new Set(controls)]
}

const unknownUnlessNoReasoning = (parameters: string[] | undefined) => {
  if (parameters === undefined || hasReasoningParameters(parameters)) {
    return null
  }
  return false
}

const nonNativeReasoning = (
  parameters: string[] | undefined,
  modality: string,
) => {
  if (modality.endsWith('->embeddings')) {
    return false
  }
  return unknownUnlessNoReasoning(parameters)
}

export const providerNativeReasoning = (
  hasReasoningObject: boolean,
  parameters: string[] | undefined,
  modality: string,
) => {
  if (hasReasoningObject) {
    return true
  }
  return nonNativeReasoning(parameters, modality)
}
