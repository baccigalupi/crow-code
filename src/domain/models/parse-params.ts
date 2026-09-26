import type { RecordParams } from '../../types.ts'
import { parseParamKeys } from '../parsers/parse-param-keys.ts'
import type { ModelParams } from '../types.ts'

const allowedModelKeys = [
  'provider_id',
  'identifier',
  'name',
  'context_length',
  'cost_input',
  'cost_output',
  'dynamic_delegation',
  'modality',
  'supported_parameters',
  'supports_reasoning',
  'can_disable_reasoning',
  'reasoning_options',
]

export const parseModelParams = (params: RecordParams) => {
  const parsedParams = parseParamKeys(params, allowedModelKeys) as ModelParams
  return {
    ...parsedParams,
    supported_parameters: JSON.stringify(parsedParams.supported_parameters),
  }
}
