import type { Knex } from 'knex'
import type { Logger } from '../../types.ts'
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
      provider_id: this.recordParams.providerId,
      reason: this.recordParams.reason,
    }
  }
}

export const createProviderAvailability = (
  database: Knex,
  logger: Logger,
  recordParams: RecordParams,
) => {
  return new CreateProviderAvailability(database, logger, recordParams)
}
