import type { Knex } from 'knex'
import type { CostOptions } from './types.ts'

export class CostFilter {
  private builder: Knex.QueryBuilder
  private options: CostOptions

  constructor(builder: Knex.QueryBuilder, options: CostOptions) {
    this.builder = builder
    this.options = options
  }

  addWhereClause() {
    this.whereFree()
    this.whereCheap()
    this.whereBudget()
    this.whereStandard()
    this.wherePremium()
    this.whereUltra()
  }

  private whereFree() {
    if (this.options.costTier !== 'free') return
    this.whereCostEquals(this.builder, 0)
  }

  private whereCheap() {
    if (this.options.costTier !== 'cheap') return
    this.whereCostRange(this.builder, 0, 0.25)
  }

  private whereBudget() {
    if (this.options.costTier !== 'budget') return
    this.whereCostRange(this.builder, 0.25, 1.7)
  }

  private whereStandard() {
    if (this.options.costTier !== 'standard') return
    this.builder
      .where((subBuilder) => this.whereCostRange(subBuilder, 1.7, 15))
      .orWhere('dynamic_delegation', 1)
  }

  private wherePremium() {
    if (this.options.costTier !== 'premium') return
    this.whereCostRange(this.builder, 15, 30)
  }

  private whereUltra() {
    if (this.options.costTier !== 'ultra') return
    this.whereCostGreaterThan(this.builder, 30)
  }

  private whereCostRange(
    builder: Knex.QueryBuilder,
    lower: number,
    upper: number,
  ) {
    builder.where('cost_output', '>', lower).where('cost_output', '<=', upper)
  }

  private whereCostEquals(builder: Knex.QueryBuilder, value: number) {
    builder.where('cost_output', value)
  }

  private whereCostGreaterThan(builder: Knex.QueryBuilder, value: number) {
    builder.where('cost_output', '>', value)
  }
}

export const costFilter = (
  builder: Knex.QueryBuilder,
  options: CostOptions,
) => {
  new CostFilter(builder, options).addWhereClause()
}
