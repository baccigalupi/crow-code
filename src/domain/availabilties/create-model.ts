import type { Knex } from 'knex'
import type { Logger } from '../../types.ts'
import { CreateRecord } from '../create.ts'
import type {
  AvailabilityReason,
  EmptyRecord,
  ModelAvailabilityRow,
} from '../types.ts'

type RecordParams = {
  modelId: number
  reason: AvailabilityReason
  retryAt?: Date
}

export class CreateModelAvailability extends CreateRecord<
  RecordParams,
  ModelAvailabilityRow,
  ModelAvailabilityRow | EmptyRecord
> {
  protected readonly tableName = 'model_availabilities'

  protected override params(): Partial<ModelAvailabilityRow> {
    return {
      model_id: this.recordParams.modelId,
      reason: this.recordParams.reason,
    }
  }
}

export const createModelAvailability = (
  database: Knex,
  logger: Logger,
  recordParams: RecordParams,
) => {
  return new CreateModelAvailability(database, logger, recordParams)
}
