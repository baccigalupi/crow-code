import type { ReasoningControl } from '../types.ts'

const reasoningParameters = [
  'reasoning',
  'include_reasoning',
  'reasoning_effort',
]

const hasReasoningParameters = (parameters: string[]) => {
  return parameters.some((parameter) => reasoningParameters.includes(parameter))
}

const controlFor = (parameter: string): ReasoningControl | null => {
  if (parameter === 'reasoning' || parameter === 'include_reasoning') {
    return 'toggle'
  }
  if (parameter === 'reasoning_effort') {
    return 'effort'
  }
  return null
}

export const supportedParametersControls = (
  parameters: string[] | undefined,
): ReasoningControl[] => {
  if (parameters === undefined) {
    return []
  }
  const controls = parameters
    .map(controlFor)
    .filter((control) => control !== null)
  return [...new Set(controls)]
}

export const providerNativeReasoning = (
  hasReasoningObject: boolean,
  parameters: string[] | undefined,
  modality: string,
) => {
  if (hasReasoningObject) {
    return true
  }
  if (modality.endsWith('->embeddings')) {
    return false
  }
  if (parameters === undefined || hasReasoningParameters(parameters)) {
    return null
  }
  return false
}
