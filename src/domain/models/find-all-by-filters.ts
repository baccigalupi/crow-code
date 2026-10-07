import type { Knex } from 'knex'
import type { ApplicationData } from '../../application-data.ts'
import type { DatabaseQuerySerializer } from '../types.ts'
import { databaseQuery } from '../database-query.ts'
import type { ModelWithProviderRow } from '../types.ts'
import type { ModelEntity } from './model.ts'
import { modelEntities } from './model.ts'
import { modelFilters } from './filters.ts'
import type { ModelFilterOptions, ModelQuery } from './types.ts'

const defaultLimit = 5

export class ModelFindAllByFilters {
  private applicationData: ApplicationData
  private options: ModelFilterOptions
  private database!: Knex

  constructor(
    applicationData: ApplicationData,
    options: ModelFilterOptions,
  ) {
    this.applicationData = applicationData
    this.options = options
  }

  async all() {
    this.database = await this.applicationData.database()
    return this.runQuery(this.query())
  }

  private query() {
    const query = this.modelProviderJoin()
      .whereNot('models.modality', 'like', '%->embeddings')

    return modelFilters(query, this.options).apply()
      .orderBy('models.id')
      .limit(this.limit())
  }

  private modelProviderJoin() {
    return this.database<ModelWithProviderRow>('models')
      .leftJoin('providers', 'providers.id', 'models.provider_id')
      .select(
        'models.*',
        'providers.base_url as provider_base_url',
        'providers.api_key_env_var as provider_api_key_env_var',
      ) as unknown as ModelQuery
  }

  private limit() {
    return this.options.limit || defaultLimit
  }

  private serializer(): DatabaseQuerySerializer<
    ModelWithProviderRow[],
    ModelEntity[]
  > {
    return (rows) => modelEntities(rows, this.applicationData.envars())
  }

  private async runQuery(query: PromiseLike<ModelWithProviderRow[]>) {
    const databaseQueryResult = await databaseQuery(
      query,
      this.applicationData.logger(),
      this.serializer(),
    )
    return databaseQueryResult.result()
  }
}

export const modelFindAllByFilters = (
  applicationData: ApplicationData,
  options: ModelFilterOptions,
) => new ModelFindAllByFilters(applicationData, options)
