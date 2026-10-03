import type { Knex } from 'knex'
import type { ApplicationData } from '../../application-data.ts'
import { createModel } from '../../domain/models/create.ts'
import type { CatalogModel } from '../types.ts'

class SaveCatalogModels {
  private applicationData: ApplicationData
  private providerId: number
  private models: CatalogModel[]

  constructor(
    applicationData: ApplicationData,
    providerId: number,
    models: CatalogModel[],
  ) {
    this.applicationData = applicationData
    this.providerId = providerId
    this.models = models
  }

  async run() {
    if (this.models.length === 0) return
    try {
      await this.refreshCatalog()
    } catch (error) {
      this.logFailure(error)
    }
  }

  private async refreshCatalog() {
    await (await this.applicationData.database()).transaction((transaction) =>
      this.refresh(transaction)
    )
  }

  private async refresh(transaction: Knex.Transaction) {
    await transaction('models').where('provider_id', this.providerId).delete()
    const saveResults = await Promise.all(
      this.models.map((model) => this.save(model, transaction)),
    )
    await this.cancelIfNothingSaved(transaction, saveResults)
  }

  private async cancelIfNothingSaved(
    transaction: Knex.Transaction,
    saveResults: boolean[],
  ) {
    if (saveResults.includes(true)) return
    this.applicationData.logger().error(
      `No models could be saved for provider ${this.providerId}; catalog refresh rolled back`,
    )
    await transaction.rollback()
  }

  private async save(model: CatalogModel, transaction: Knex.Transaction) {
    const created = await createModel(
      this.applicationData.withDatabase(transaction),
      this.toModelParams(model),
    )
    return created.success()
  }

  private logFailure(error: unknown) {
    this.applicationData.logger().error(
      `Model catalog refresh for provider ${this.providerId} rolled back: ${
        (error as Error).message
      }`,
    )
  }

  private toModelParams(model: CatalogModel) {
    return { ...model, identifier: model.id, providerId: this.providerId }
  }
}

export const saveCatalogModels = async (
  applicationData: ApplicationData,
  providerId: number,
  models: CatalogModel[],
) => {
  await new SaveCatalogModels(applicationData, providerId, models).run()
}
