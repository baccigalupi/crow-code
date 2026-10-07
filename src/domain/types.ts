export type DatabaseQuerySerializer<Result, Serialized> = (
  result: Result,
) => Serialized

export type DatabaseQueryArguments<Result, Serialized> = {
  query: PromiseLike<Result[]>
  resultSerializer?: DatabaseQuerySerializer<Result[], Serialized>
}

export type RecordParamValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | DefaultReasoning

export type RecordParams = Record<string, RecordParamValue>

export type DefaultReasoning = {
  mandatory?: boolean
  default_enabled?: boolean
  default_effort?: string
  supported_efforts?: string[]
  supports_max_tokens?: boolean
}

export type ModelRow = {
  id: number
  provider_id: number
  identifier: string
  name: string
  context_length: number | null
  cost_input: number | null
  cost_output: number | null
  dynamic_delegation: boolean
  modality: string
  supported_parameters: string
  supports_reasoning: boolean
  can_disable_reasoning: boolean
  reasoning_options: string
}

export type ModelWithProviderRow = ModelRow & {
  provider_base_url: string
  provider_api_key_env_var: string | null
}

export type ModelEntityRow =
  & Partial<ModelWithProviderRow>
  & Pick<
    ModelRow,
    | 'dynamic_delegation'
    | 'supported_parameters'
    | 'supports_reasoning'
    | 'can_disable_reasoning'
    | 'reasoning_options'
  >

export type ModelParams = {
  provider_id: number
  identifier: string
  name: string
  context_length: number | null
  cost_input: number | null
  cost_output: number | null
  dynamic_delegation: boolean
  modality: string
  supported_parameters: string[]
  supports_reasoning: boolean
  can_disable_reasoning: boolean
  reasoning_options: DefaultReasoning
}

export type ProviderRecord = {
  id: number
  name: string
  base_url: string
  models_path: string | null
  api_key_env_var: string | null
}
export type EmptyRecord = Record<string, never>

export type AvailabilityReason = 'no-api-key'

export type ProviderAvailabilityRow = {
  id: number
  provider_id: number
  reason: AvailabilityReason
  retry_at: string | null
  updated_at: string
}

export type ModelAvailabilityRow = {
  id: number
  model_id: number
  reason: AvailabilityReason
  retry_at: string | null
  updated_at: string
}
