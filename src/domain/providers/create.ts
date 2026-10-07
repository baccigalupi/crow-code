import type { ApplicationData } from '../../application-data.ts'
import type { ParsedArgumentsOptions } from '../../cli/types.ts'
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
  protected override logPrefix = 'Create provider: '

  protected override params(): Partial<ProviderRecord> {
    return parseParamKeys(
      this.operationArguments,
      allowedProviderKeys,
    ) as Partial<ProviderRecord>
  }
}

export const createProvider = (
  applicationData: ApplicationData,
  options: ParsedArgumentsOptions,
) => new CreateProvider({ applicationData, operationArguments: options })
