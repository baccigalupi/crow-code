import type { Knex } from 'knex'
import type { Logger, RecordParams } from '../../types.ts'
import { type DatabaseQuery, databaseQuery } from '../database-query.ts'
import type { ModelRow } from '../types.ts'
import { type ModelEntity, modelEntity } from './model.ts'
import { parseModelParams } from './parse-params.ts'

type QueryResult = Promise<DatabaseQuery<ModelRow, ModelEntity>>

export class CreateModel {
  private database: Knex
  private logger: Logger
  private recordParams: RecordParams
  private queryResult?: QueryResult

  constructor(database: Knex, logger: Logger, params: RecordParams) {
    this.database = database
    this.logger = logger
    this.recordParams = params
  }

  async create() {
    await this.runQuery()
    return this
  }

  async success() {
    return (await this.runQuery()).success()
  }

  async record() {
    return (await this.runQuery()).result()
  }

  private runQuery(): QueryResult {
    if (this.queryResult) return this.queryResult
    this.queryResult = databaseQuery(
      this.query(),
      this.logger,
      this.serialize,
    )
    return this.queryResult
  }

  private query() {
    return this.database('models')
      .insert(this.attributes())
      .returning<ModelRow[]>('*')
  }

  private attributes() {
    return parseModelParams(this.recordParams)
  }

  private serialize(rows: ModelRow[]) {
    return modelEntity(rows[0])
  }
}

export const createModel = async (
  database: Knex,
  logger: Logger,
  params: RecordParams,
) => {
  return await new CreateModel(database, logger, params).create()
}
