import type { ApplicationData } from '../../application-data.ts'
import type { DatabaseQuerySerializer } from '../types.ts'
import { databaseQuery } from '../database-query.ts'
import type { ProviderRecord } from '../types.ts'
import type { ProviderEntity } from './entity.ts'
import { providerEntities } from './entity.ts'

export class ProviderFindAll {
  private applicationData: ApplicationData

  constructor(applicationData: ApplicationData) {
    this.applicationData = applicationData
  }

  async all() {
    const database = await this.applicationData.database()
    const query = database<ProviderRecord>('providers')

    return this.runQuery(query)
  }

  private serializer(): DatabaseQuerySerializer<
    ProviderRecord[],
    ProviderEntity[]
  > {
    return (result) => providerEntities(result, this.applicationData.envars())
  }

  private async runQuery(query: PromiseLike<ProviderRecord[]>) {
    const databaseQueryResult = await databaseQuery({
      applicationData: this.applicationData,
      operationArguments: { query, resultSerializer: this.serializer() },
    }).run()
    return databaseQueryResult.result()
  }
}

export const providerFindAll = (applicationData: ApplicationData) =>
  new ProviderFindAll(applicationData)
