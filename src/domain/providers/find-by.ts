import type { Knex } from 'knex'
import type { Environment } from '../../env-vars.ts'
import type { DatabaseQuerySerializer, Logger } from '../../types.ts'
import { databaseQuery } from '../database-query.ts'
import type { ProviderRecord } from '../types.ts'
import type { ProviderModel } from './provider.ts'
import { providerModel } from './provider.ts'

export class ProviderFindBy {
  private environment: Environment
  private database: Knex
  private logger: Logger

  constructor(environment: Environment, database: Knex, logger: Logger) {
    this.environment = environment
    this.database = database
    this.logger = logger
  }

  getByName(name: string) {
    const query = this.database<ProviderRecord>('providers').where({ name })

    return this.runQuery(query)
  }

  getById(id: number) {
    const query = this.database<ProviderRecord>('providers').where({ id })

    return this.runQuery(query)
  }

  private serializer(): DatabaseQuerySerializer<
    ProviderRecord[],
    ProviderModel | undefined
  > {
    return (result) => providerModel(result[0], this.environment)
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

export const providerFindBy = (
  environment: Environment,
  database: Knex,
  logger: Logger,
) => new ProviderFindBy(environment, database, logger)
