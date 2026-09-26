import type { RecordParams, RecordParamValue } from '../../../types.ts'
import { normalize } from './normalize-keys.ts'

const addNormalizedKey = (
  result: RecordParams,
  key: string,
  value: RecordParamValue,
) => {
  const normalizedKey = normalize(key)
  result[normalizedKey] = value
  return result
}

export const normalizeParamKeys = (
  options: RecordParams,
) => {
  return Object.entries(options).reduce(
    (result, [key, value]) => addNormalizedKey(result, key, value),
    {},
  )
}
