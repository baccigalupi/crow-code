import type { Knex } from 'knex'
import type { DatabaseQuerySerializer, Logger } from '../../types.ts'
import { databaseQuery } from '../database-query.ts'
import type { ModelRow } from '../types.ts'
import type { ModelEntity } from './model.ts'
import { modelEntities } from './model.ts'
import { costFilter } from './filters/cost.ts'
import { reasoningFilter } from './filters/reasoning.ts'
import type { ModelFilterOptions } from './types.ts'

const defaultLimit = 5

export class ModelFindAllByFilters {
  private database: Knex
  private logger: Logger
  private options: ModelFilterOptions

  constructor(
    database: Knex,
    logger: Logger,
    options: ModelFilterOptions,
  ) {
    this.database = database
    this.logger = logger
    this.options = options
  }

  all() {
    return this.runQuery(this.query())
  }

  private query() {
    const query = this.database<ModelRow>('models')
      .whereNot('modality', 'like', '%->embeddings')
    return this.ordering(this.applyFilters(query)).limit(this.limit())
  }

  private limit() {
    if (this.options.limit === undefined) return defaultLimit
    return this.options.limit
  }

  private applyFilters(query: Knex.QueryBuilder<ModelRow, ModelRow[]>) {
    return this.applyTypeFilter(this.applyCostTierFilter(query))
  }

  private applyCostTierFilter(
    query: Knex.QueryBuilder<ModelRow, ModelRow[]>,
  ) {
    if (this.options.costTier === undefined) return query
    const costTier = this.options.costTier
    return query.where((sub) => costFilter(sub, { costTier }))
  }

  private applyTypeFilter(query: Knex.QueryBuilder<ModelRow, ModelRow[]>) {
    if (this.options.type === undefined) return query
    const type = this.options.type
    return query.where((sub) => reasoningFilter(sub, { type }))
  }

  private ordering(query: Knex.QueryBuilder<ModelRow, ModelRow[]>) {
    return query.orderBy('id')
  }

  private serializer(): DatabaseQuerySerializer<ModelRow[], ModelEntity[]> {
    return modelEntities
  }

  private async runQuery(query: PromiseLike<ModelRow[]>) {
    const databaseQueryResult = await databaseQuery(
      query,
      this.logger,
      this.serializer(),
    )
    return databaseQueryResult.result()
  }
}

export const modelFindAllByFilters = (
  database: Knex,
  logger: Logger,
  options: ModelFilterOptions,
) => new ModelFindAllByFilters(database, logger, options)
