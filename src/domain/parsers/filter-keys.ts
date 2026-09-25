import type { ParsedArgumentsOptions } from '../../types.ts'

const addAllowedKey = (
  result: ParsedArgumentsOptions,
  allowedKeys: string[],
  key: string,
  value: string | boolean,
) => {
  if (allowedKeys.includes(key)) {
    result[key] = value
  }
  return result
}

export const filterKeys = (
  options: ParsedArgumentsOptions,
  allowedKeys: string[],
) => {
  return Object.entries(options).reduce(
    (result, [key, value]) => addAllowedKey(result, allowedKeys, key, value),
    {},
  )
}
