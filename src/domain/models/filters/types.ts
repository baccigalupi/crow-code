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
