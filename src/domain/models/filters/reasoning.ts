import type { Knex } from 'knex'
import type { ReasoningOptions } from '../types.ts'

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
    this.whereLow()
    this.whereMedium()
    this.whereHigh()
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

  private whereLow() {
    if (this.options.type !== 'low') return
    this.builder
      .where('supports_reasoning', true)
      .where((subBuilder) => this.whereLowReasoning(subBuilder))
  }

  private whereLowReasoning(builder: Knex.QueryBuilder) {
    builder
      .whereLike('reasoning_options', '%"low"%')
      .orWhereLike('reasoning_options', '%"minimal"%')
      .orWhereLike('reasoning_options', '%"supports_max_tokens":true%')
      .orWhereLike('supported_parameters', '%"reasoning_effort"%')
  }

  private whereMedium() {
    if (this.options.type !== 'medium') return
    this.builder
      .where('supports_reasoning', true)
      .where((subBuilder) => this.whereMediumReasoning(subBuilder))
  }

  private whereMediumReasoning(builder: Knex.QueryBuilder) {
    builder
      .whereLike('reasoning_options', '%"medium"%')
      .orWhereLike('reasoning_options', '%"supports_max_tokens":true%')
      .orWhereLike('supported_parameters', '%"reasoning_effort"%')
  }

  private whereHigh() {
    if (this.options.type !== 'high') return
    this.builder
      .where('supports_reasoning', true)
      .where((subBuilder) => this.whereHighReasoning(subBuilder))
  }

  private whereHighReasoning(builder: Knex.QueryBuilder) {
    builder
      .whereLike('reasoning_options', '%"high"%')
      .orWhereLike('reasoning_options', '%"xhigh"%')
      .orWhereLike('reasoning_options', '%"max"%')
      .orWhereLike('reasoning_options', '%"supports_max_tokens":true%')
      .orWhereLike('supported_parameters', '%"reasoning_effort"%')
  }
}

export const reasoningFilter = (
  builder: Knex.QueryBuilder,
  options: ReasoningOptions,
) => {
  new ReasoningFilter(builder, options).addWhereClause()
}
