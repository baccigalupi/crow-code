import type { Knex } from 'knex'
import type { ReasoningOptions } from './types.ts'

export class ReasoningFilter {
  private builder: Knex.QueryBuilder
  private options: ReasoningOptions

  constructor(builder: Knex.QueryBuilder, options: ReasoningOptions) {
    this.builder = builder
    this.options = options
  }

  addWhereClause() {
    this.whereDynamic()
    this.whereChat()
  }

  private whereDynamic() {
    if (this.options.type !== 'dynamic') return
    this.builder.where('dynamic_delegation', true)
  }

  private whereChat() {
    if (this.options.type !== 'chat') return
    this.builder
      .where('dynamic_delegation', false)
      .where((subBuilder) => this.whereChatReasoning(subBuilder))
  }

  private whereChatReasoning(builder: Knex.QueryBuilder) {
    builder
      .where('supports_reasoning', false)
      .orWhere('can_disable_reasoning', true)
  }
}

export const reasoningFilter = (
  builder: Knex.QueryBuilder,
  options: ReasoningOptions,
) => {
  new ReasoningFilter(builder, options).addWhereClause()
}
