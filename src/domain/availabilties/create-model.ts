import type { ApplicationData } from '../../application-data.ts'
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
      model_id: this.operationArguments.modelId,
      reason: this.operationArguments.reason,
    }
  }
}

export const createModelAvailability = (
  applicationData: ApplicationData,
  recordParams: RecordParams,
) =>
  new CreateModelAvailability({
    applicationData,
    operationArguments: recordParams,
  })
