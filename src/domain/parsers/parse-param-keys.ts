import type { ParsedArgumentsOptions } from '../../types.ts'
import { filterKeys } from './filter-keys.ts'
import { normalizeRecordKeys } from './normalize-record-keys.ts'

export const parseParamKeys = (
  options: ParsedArgumentsOptions,
  allowedKeys: string[],
) => {
  const normalizedOptions = normalizeRecordKeys(options)
  return filterKeys(normalizedOptions, allowedKeys)
}
