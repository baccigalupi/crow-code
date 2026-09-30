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

export type ReasoningOptions = {
  type: ReasoningType
}
