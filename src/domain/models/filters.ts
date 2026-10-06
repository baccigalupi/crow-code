import { costFilter } from './filters/cost.ts'
import { reasoningFilter } from './filters/reasoning.ts'
import type { ModelFilterOptions, ModelQuery } from './types.ts'

export class ModelFilters {
  private query: ModelQuery
  private options: ModelFilterOptions

  constructor(query: ModelQuery, options: ModelFilterOptions) {
    this.query = query
    this.options = options
  }

  apply() {
    this.applyCostTierFilter()
    this.applyTypeFilter()
    return this.query
  }

  private applyCostTierFilter() {
    if (!this.options.costTier) return

    const costTier = this.options.costTier
    this.query = this.query.where((sub) => costFilter(sub, { costTier }))
  }

  private applyTypeFilter() {
    if (!this.options.type) return

    const type = this.options.type
    this.query = this.query.where((sub) => reasoningFilter(sub, { type }))
  }
}

export const modelFilters = (query: ModelQuery, options: ModelFilterOptions) =>
  new ModelFilters(query, options)
