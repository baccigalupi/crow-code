import type { Knex } from 'knex'
import type { DatabaseQuerySerializer, Logger } from '../../types.ts'
import { databaseQuery } from '../database-query.ts'
import type { ModelRow } from '../types.ts'
import type { ModelEntity } from './model.ts'
import { modelEntity } from './model.ts'

const defaultCheapCostThreshold = 0.25

export class ModelFindCheapNoReasoning {
  private database: Knex
  private logger: Logger
  private cheapCostThreshold: number

  constructor(
    database: Knex,
    logger: Logger,
    cheapCostThreshold = defaultCheapCostThreshold,
  ) {
    this.database = database
    this.logger = logger
    this.cheapCostThreshold = cheapCostThreshold
  }

  first(count: number) {
    return this.runQuery(this.query(count))
  }

  private query(count: number) {
    const query = this.database<ModelRow>('models')
      .where('dynamic_delegation', 0)
      .where(this.eligibility)
      .where('cost_output', '<=', this.cheapCostThreshold)
      .whereNot('modality', 'like', '%->embeddings')
    return this.ordering(query).limit(count)
  }

  private eligibility(builder: Knex.QueryBuilder<ModelRow>) {
    builder.where('supports_reasoning', 0).orWhere('can_disable_reasoning', 1)
  }

  private ordering(query: Knex.QueryBuilder<ModelRow, ModelRow[]>) {
    return query.orderBy('id')
  }

  private serializer(): DatabaseQuerySerializer<ModelRow[], ModelEntity[]> {
    return (result) => result.map((row) => modelEntity(row))
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

export const modelFindCheapNoReasoning = (database: Knex, logger: Logger) =>
  new ModelFindCheapNoReasoning(database, logger)
