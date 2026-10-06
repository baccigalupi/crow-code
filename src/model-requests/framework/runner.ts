import type { ApplicationData } from '../../application-data.ts'
import type { ModelEntity } from '../../domain/models/model.ts'
import type { ModelFilterOptions } from '../../domain/models/types.ts'
import type { ModelApiRequest } from './model-api-request.ts'
import type { ModelApiRequestClass } from '../types.ts'
import { modelFindAllByFilters } from '../../domain/models/find-all-by-filters.ts'

export class Runner<TRequest, TResponse> {
  private applicationData: ApplicationData
  private modelFilters: ModelFilterOptions
  private modelApiRequest: ModelApiRequestClass<TRequest, TResponse>
  private requestData: TRequest
  private request?: ModelApiRequest<TRequest, TResponse>
  private response?: TResponse
  private _models?: ModelEntity[]
  private succeeded = false

  constructor(
    applicationData: ApplicationData,
    options: ModelFilterOptions,
    modelApiRequest: ModelApiRequestClass<TRequest, TResponse>,
    requestData: TRequest,
  ) {
    this.applicationData = applicationData
    this.modelFilters = options
    this.modelApiRequest = modelApiRequest
    this.requestData = requestData
  }

  async run() {
    const models = await this.models()
    await models.reduce(
      (chain, model) => chain.then(() => this.makeModelRequest(model)),
      Promise.resolve(),
    )
    return this
  }

  success() {
    return this.succeeded
  }

  result() {
    return this.response
  }

  private async models() {
    if (this._models) return this._models

    this._models = await modelFindAllByFilters(
      this.applicationData,
      this.modelFilters,
    ).all()

    return this._models
  }

  private async makeModelRequest(model: ModelEntity) {
    if (this.success()) return

    this.request = this.createRequest(model)
    await this.request.run()
    if (this.request.success()) {
      this.response = this.request.result()
      this.succeeded = true
    }
  }

  private createRequest(model: ModelEntity) {
    return new this.modelApiRequest(
      model.endpoint(),
      this.applicationData,
      this.requestData,
    )
  }
}
