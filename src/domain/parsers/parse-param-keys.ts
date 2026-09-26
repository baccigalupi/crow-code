import type { RecordParams } from '../../types.ts'
import { filterKeys } from './parse-params/filter-keys.ts'
import { normalizeParamKeys } from './parse-params/normalize-param-keys.ts'

export const parseParamKeys = (
  options: RecordParams,
  allowedKeys: string[],
) => {
  const normalizedOptions = normalizeParamKeys(options)
  return filterKeys(normalizedOptions, allowedKeys)
}
