import type { ReasoningOption } from '../types.ts'
import { lookupReasoningOption } from './lookup-reasoning-options.ts'

export const reasoningOptions = (
  parameters: string[] | undefined,
): ReasoningOption[] => {
  if (parameters === undefined) {
    return []
  }
  const options = parameters
    .map(lookupReasoningOption)
    .filter((option) => option !== undefined)
  return [...new Set(options)]
}
