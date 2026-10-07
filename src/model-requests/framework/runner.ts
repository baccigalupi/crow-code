import type { ModelEntity } from '../../domain/models/model.ts'
import type { ModelFilterOptions } from '../../domain/models/types.ts'
import type { ModelApiRequestClass } from '../types.ts'
import { modelFindAllByFilters } from '../../domain/models/find-all-by-filters.ts'
import { OperationWithResult } from '../../operation.ts'

type RunnerArguments<TRequest, TResponse> = {
  modelFilters: ModelFilterOptions
  modelApiRequest: ModelApiRequestClass<TRequest, TResponse>
  requestData: TRequest
}

export class Runner<TRequest, TResponse> extends OperationWithResult<
  RunnerArguments<TRequest, TResponse>,
  TResponse | undefined
> {
  protected override logPrefix = 'Model API Request: '
  private response?: TResponse
  private _models?: ModelEntity[]

  result() {
    return this.response
  }

  async run() {
    const models = await this.models()
    await models.reduce(
      (chain, model) => chain.then(() => this.makeModelRequest(model)),
      Promise.resolve(),
    )
    if (this.response === undefined) this.fail('all model requests failed')
    return this
  }

  private async models() {
    if (this._models) return this._models

    this._models = await modelFindAllByFilters(
      this.applicationData,
      this.operationArguments.modelFilters,
    ).all()

    return this._models
  }

  private async makeModelRequest(model: ModelEntity) {
    if (this.response !== undefined) return

    const request = this.createRequest(model)
    await request.run()
    if (request.success()) this.response = request.result()
  }

  private createRequest(model: ModelEntity) {
    return new this.operationArguments.modelApiRequest(
      model.endpoint(),
      this.applicationData,
      this.operationArguments.requestData,
    )
  }
}
