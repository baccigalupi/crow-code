import type { Knex } from 'knex'
import type { ApplicationData } from '../../application-data.ts'
import type { CatalogModel, SaveCatalogModelsArguments } from '../types.ts'
import { createModel } from '../../domain/models/create.ts'
import { Operation } from '../../operation.ts'

export class SaveCatalogModels extends Operation<SaveCatalogModelsArguments> {
  protected override logPrefix = 'Save catalog models: '

  async run() {
    if (this.operationArguments.models.length === 0) return this

    await this.tryRefresh()
    return this
  }

  private async tryRefresh() {
    try {
      await this.refreshCatalog()
    } catch (error) {
      this.fail(this.rollbackMessage(error))
    }
  }

  private rollbackMessage(error: unknown) {
    return `Model catalog refresh for provider ${this.providerId()} rolled back: ${
      (error as Error).message
    }`
  }

  private providerId() {
    return this.operationArguments.providerId
  }

  private models() {
    return this.operationArguments.models
  }

  private async refreshCatalog() {
    await (await this.applicationData.database()).transaction((transaction) =>
      this.refresh(transaction)
    )
  }

  private async refresh(transaction: Knex.Transaction) {
    await transaction('models').where('provider_id', this.providerId()).delete()
    const saveResults = await Promise.all(
      this.models().map((model) => this.save(model, transaction)),
    )
    await this.cancelIfNothingSaved(transaction, saveResults)
  }

  private async cancelIfNothingSaved(
    transaction: Knex.Transaction,
    saveResults: boolean[],
  ) {
    if (saveResults.includes(true)) return
    this.applicationData.logger().error(
      `No models could be saved for provider ${this.providerId()}; catalog refresh rolled back`,
    )
    await transaction.rollback()
  }

  private async save(model: CatalogModel, transaction: Knex.Transaction) {
    const created = await createModel(
      this.applicationData.withDatabase(transaction),
      this.toModelParams(model),
    ).run()
    return created.success()
  }

  private toModelParams(model: CatalogModel) {
    return { ...model, identifier: model.id, providerId: this.providerId() }
  }
}

export const saveCatalogModels = (
  applicationData: ApplicationData,
  providerId: number,
  models: CatalogModel[],
) => {
  return new SaveCatalogModels({
    applicationData,
    operationArguments: { providerId, models },
  })
}
