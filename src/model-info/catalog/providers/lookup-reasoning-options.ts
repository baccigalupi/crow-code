import type { ReasoningOption } from '../../types.ts'

const reasoningOptions: Record<string, ReasoningOption> = {
  reasoning: 'toggle',
  include_reasoning: 'toggle',
  reasoning_effort: 'effort',
}

export const lookupReasoningOption = (
  parameter: string,
): ReasoningOption | undefined => {
  if (!(parameter in reasoningOptions)) {
    return undefined
  }
  return reasoningOptions[parameter]
}
