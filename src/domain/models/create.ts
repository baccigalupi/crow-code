import type { Knex } from 'knex'
import type { Logger, RecordParams } from '../../types.ts'
import { CreateRecord } from '../create.ts'
import { type DatabaseQuery, databaseQuery } from '../database-query.ts'
import type { ModelRow } from '../types.ts'
import { type ModelEntity, modelEntity } from './model.ts'
import { parseModelParams } from './parse-params.ts'

type QueryResult = Promise<DatabaseQuery<ModelRow, ModelEntity>>

export class CreateModel
  extends CreateRecord<RecordParams, ModelRow, ModelEntity> {
  protected readonly tableName = 'models'
  private queryResult?: QueryResult

  override async create() {
    await this.runQuery()
    return this
  }

  override async success() {
    return (await this.runQuery()).success()
  }

  override async record() {
    return (await this.runQuery()).result()
  }

  private runQuery(): QueryResult {
    if (this.queryResult) return this.queryResult
    this.queryResult = databaseQuery(
      this.query(),
      this.logger,
      this.serializeRows,
    )
    return this.queryResult
  }

  private query() {
    return this.database(this.tableName)
      .insert(this.attributes())
      .returning<ModelRow[]>('*')
  }

  private attributes() {
    return parseModelParams(this.recordParams)
  }

  private serializeRows(rows: ModelRow[]) {
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
