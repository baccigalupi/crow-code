import type { Knex } from 'knex'
import type { Logger, ParsedArgumentsOptions } from '../../types.ts'
import type { EmptyRecord, ProviderRecord } from '../types.ts'
import { parseParamKeys } from '../parsers/parse-param-keys.ts'

const allowedProviderKeys = [
  'name',
  'base_url',
  'models_path',
  'api_key_env_var',
]

export class CreateProvider {
  private database: Knex
  private logger: Logger
  private recordParams: ParsedArgumentsOptions
  private result: ProviderRecord | EmptyRecord = {}
  private succeeded = false

  constructor(
    database: Knex,
    logger: Logger,
    recordParams: ParsedArgumentsOptions,
  ) {
    this.database = database
    this.logger = logger
    this.recordParams = recordParams
  }

  async create() {
    try {
      await this.save()
    } catch (error) {
      this.logger.error((error as Error).message)
    }
    return this
  }

  success() {
    return this.succeeded
  }

  record() {
    return this.result
  }

  private async save() {
    await this.insert()
    this.succeeded = true
  }

  private async insert() {
    const [record] = await this.database('providers')
      .insert(this.attributes())
      .returning('*')
    this.result = record
  }

  private attributes() {
    return parseParamKeys(this.recordParams, allowedProviderKeys)
  }
}

export const createProvider = async (
  database: Knex,
  logger: Logger,
  recordParams: ParsedArgumentsOptions,
) => {
  return await new CreateProvider(database, logger, recordParams).create()
}
