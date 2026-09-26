import type { RecordParams, RecordParamValue } from '../../../types.ts'

const addAllowedKey = (
  result: RecordParams,
  allowedKeys: string[],
  key: string,
  value: RecordParamValue,
) => {
  if (allowedKeys.includes(key)) {
    result[key] = value
  }
  return result
}

export const filterKeys = (
  options: RecordParams,
  allowedKeys: string[],
) => {
  return Object.entries(options).reduce(
    (result, [key, value]) => addAllowedKey(result, allowedKeys, key, value),
    {},
  )
}
