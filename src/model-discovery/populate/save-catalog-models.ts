import type { Knex } from 'knex'
import type { Logger } from '../../types.ts'
import { createModel } from '../../domain/models/create.ts'
import type { CatalogModel } from '../types.ts'

class SaveCatalogModels {
  private database: Knex
  private providerId: number
  private models: CatalogModel[]
  private logger: Logger

  constructor(
    database: Knex,
    providerId: number,
    models: CatalogModel[],
    logger: Logger,
  ) {
    this.database = database
    this.providerId = providerId
    this.models = models
    this.logger = logger
  }

  async run() {
    await Promise.all(this.models.map((model) => this.save(model)))
  }

  private save(model: CatalogModel) {
    return createModel(this.database, this.logger, this.toModelParams(model))
  }

  private toModelParams(model: CatalogModel) {
    return { ...model, identifier: model.id, providerId: this.providerId }
  }
}

export const saveCatalogModels = async (
  database: Knex,
  providerId: number,
  models: CatalogModel[],
  logger: Logger,
) => {
  await new SaveCatalogModels(database, providerId, models, logger).run()
}
