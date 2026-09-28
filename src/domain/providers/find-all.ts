import type { Knex } from 'knex'
import type { Environment } from '../../env-vars.ts'
import type { DatabaseQuerySerializer, Logger } from '../../types.ts'
import { databaseQuery } from '../database-query.ts'
import type { ProviderRecord } from '../types.ts'
import type { ProviderModel } from './provider.ts'
import { providerModels } from './provider.ts'

export class ProviderFindAll {
  private environment: Environment
  private database: Knex
  private logger: Logger

  constructor(environment: Environment, database: Knex, logger: Logger) {
    this.environment = environment
    this.database = database
    this.logger = logger
  }

  all() {
    const query = this.database<ProviderRecord>('providers')

    return this.runQuery(query)
  }

  private serializer(): DatabaseQuerySerializer<
    ProviderRecord[],
    ProviderModel[]
  > {
    return (result) => providerModels(result, this.environment)
  }

  private async runQuery(query: PromiseLike<ProviderRecord[]>) {
    const databaseQueryResult = await databaseQuery(
      query,
      this.logger,
      this.serializer(),
    )
    return databaseQueryResult.result()
  }
}

export const providerFindAll = (
  environment: Environment,
  database: Knex,
  logger: Logger,
) => new ProviderFindAll(environment, database, logger)
