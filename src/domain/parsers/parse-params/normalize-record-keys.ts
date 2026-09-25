import type { ParsedArgumentsOptions } from '../../../types.ts'
import { normalize } from './normalize-keys.ts'

const addNormalizedKey = (
  result: ParsedArgumentsOptions,
  key: string,
  value: string | boolean,
) => {
  const normalizedKey = normalize(key)
  result[normalizedKey] = value
  return result
}

export const normalizeRecordKeys = (
  options: ParsedArgumentsOptions,
) => {
  return Object.entries(options).reduce(
    (result, [key, value]) => addNormalizedKey(result, key, value),
    {},
  )
}
