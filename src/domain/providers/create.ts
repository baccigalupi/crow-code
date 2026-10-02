import type { Knex } from 'knex'
import type { Logger, ParsedArgumentsOptions } from '../../types.ts'
import { CreateRecord } from '../create.ts'
import { parseParamKeys } from '../parsers/parse-param-keys.ts'
import type { EmptyRecord, ProviderRecord } from '../types.ts'

const allowedProviderKeys = [
  'name',
  'base_url',
  'models_path',
  'api_key_env_var',
]

export class CreateProvider extends CreateRecord<
  ParsedArgumentsOptions,
  ProviderRecord,
  ProviderRecord | EmptyRecord
> {
  protected readonly tableName = 'providers'

  protected override params(): Partial<ProviderRecord> {
    return parseParamKeys(
      this.recordParams,
      allowedProviderKeys,
    ) as Partial<ProviderRecord>
  }
}

export const createProvider = async (
  database: Knex,
  logger: Logger,
  recordParams: ParsedArgumentsOptions,
) => {
  return await new CreateProvider(database, logger, recordParams).create()
}
