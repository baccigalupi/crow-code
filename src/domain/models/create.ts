import type { ApplicationData } from '../../application-data.ts'
import type { RecordParams } from '../types.ts'
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
  applicationData: ApplicationData,
  params: RecordParams,
) => await new CreateModel(applicationData, params).create()
