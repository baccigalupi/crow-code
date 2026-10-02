import type { DefaultReasoning } from '../types.ts'

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
