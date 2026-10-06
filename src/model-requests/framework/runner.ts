import type { ApplicationData } from '../../application-data.ts'
import type { ModelEntity } from '../../domain/models/model.ts'
import type { ModelFilterOptions } from '../../domain/models/types.ts'
import type { ModelApiRequest } from './model-api-request.ts'
import { modelFindAllByFilters } from '../../domain/models/find-all-by-filters.ts'

export class Runner<TRequest, TResponse> {
  private applicationData: ApplicationData
  private modelFilters: ModelFilterOptions
  private modelApiRequest: ModelApiRequest<TRequest, TResponse>
  private _models?: ModelEntity[]

  constructor(
    applicationData: ApplicationData,
    options: ModelFilterOptions,
    modelApiRequest: ModelApiRequest<TRequest, TResponse>,
  ) {
    this.applicationData = applicationData
    this.modelFilters = options
    this.modelApiRequest = modelApiRequest
  }

  async models() {
    if (this._models) return this._models

    this._models = await modelFindAllByFilters(
      this.applicationData,
      this.modelFilters,
    ).all()

    return this._models
  }

  async runModels() {
    const _models = await this.models()
  }

  async runModel(_model: ModelEntity) {
  }
}
