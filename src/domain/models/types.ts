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
