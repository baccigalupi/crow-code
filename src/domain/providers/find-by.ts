import type { ApplicationData } from '../../application-data.ts'
import type { DatabaseQuerySerializer } from '../types.ts'
import { databaseQuery } from '../database-query.ts'
import type { ProviderRecord } from '../types.ts'
import type { ProviderEntity } from './entity.ts'
import { providerEntities } from './entity.ts'

export class ProviderFindBy {
  private applicationData: ApplicationData

  constructor(applicationData: ApplicationData) {
    this.applicationData = applicationData
  }

  async getByName(name: string) {
    const database = await this.applicationData.database()
    const query = database<ProviderRecord>('providers').where({ name })

    return this.runQuery(query)
  }

  async getById(id: number) {
    const database = await this.applicationData.database()
    const query = database<ProviderRecord>('providers').where({ id })

    return this.runQuery(query)
  }

  private serializer(): DatabaseQuerySerializer<
    ProviderRecord[],
    ProviderEntity | undefined
  > {
    return (result) =>
      providerEntities(result, this.applicationData.envars())[0]
  }

  private async runQuery(query: PromiseLike<ProviderRecord[]>) {
    const databaseQueryResult = await databaseQuery({
      applicationData: this.applicationData,
      operationArguments: { query, resultSerializer: this.serializer() },
    }).run()
    return databaseQueryResult.result()
  }
}

export const providerFindBy = (applicationData: ApplicationData) =>
  new ProviderFindBy(applicationData)
