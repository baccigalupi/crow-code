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

export type ReasoningOptions = {
  type: ReasoningType
}
