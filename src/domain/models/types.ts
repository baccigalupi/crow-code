import type { Knex } from 'knex'
import type { ModelWithProviderRow } from '../types.ts'

export type ModelQuery = Knex.QueryBuilder<
  ModelWithProviderRow,
  ModelWithProviderRow[]
>

export type CostTier =
  | 'free'
  | 'cheap'
  | 'budget'
  | 'standard'
  | 'premium'
  | 'ultra'

export type CostOptions = {
  costTier: CostTier
}

export type ReasoningType =
  | 'chat'
  | 'dynamic'
  | 'low'
  | 'medium'
  | 'high'

export type ReasoningOptions = {
  type: ReasoningType
}

export type ModelFilters =
  | { costTier: CostTier; type?: ReasoningType }
  | { costTier?: CostTier; type: ReasoningType }

export type ModelFilterOptions = ModelFilters & { limit?: number }
