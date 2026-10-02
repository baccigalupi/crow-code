import type { Knex } from 'knex'
import type { Logger, RecordParams } from '../../types.ts'
import { CreateRecord } from '../create.ts'
import type { ModelRow } from '../types.ts'
import { type ModelEntity, modelEntity } from './model.ts'
import { parseModelParams } from './parse-params.ts'

export class CreateModel
  extends CreateRecord<RecordParams, ModelRow, ModelEntity> {
  protected readonly tableName = 'models'

  protected override params(): RecordParams {
    return parseModelParams(this.recordParams)
  }

  protected override serialize(rows: ModelRow[]) {
    return modelEntity(rows[0])
  }

  protected override emptyRecord() {
    return modelEntity()
  }
}

export const createModel = async (
  database: Knex,
  logger: Logger,
  params: RecordParams,
) => {
  return await new CreateModel(database, logger, params).create()
}
