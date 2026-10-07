import type { ApplicationData } from '../../application-data.ts'
import { CreateRecord } from '../create.ts'
import type {
  AvailabilityReason,
  EmptyRecord,
  ProviderAvailabilityRow,
} from '../types.ts'

type RecordParams = {
  providerId: number
  reason: AvailabilityReason
  retryAt?: Date
}

export class CreateProviderAvailability extends CreateRecord<
  RecordParams,
  ProviderAvailabilityRow,
  ProviderAvailabilityRow | EmptyRecord
> {
  protected readonly tableName = 'provider_availabilities'

  protected override params(): Partial<ProviderAvailabilityRow> {
    return {
      provider_id: this.operationArguments.providerId,
      reason: this.operationArguments.reason,
    }
  }
}

export const createProviderAvailability = (
  applicationData: ApplicationData,
  recordParams: RecordParams,
) =>
  new CreateProviderAvailability({
    applicationData,
    operationArguments: recordParams,
  })
