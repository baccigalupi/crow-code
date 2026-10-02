import { ModelRequestErrorHandler } from './model-request-error-handler.ts'
import type { ApplicationData, Logger } from '../../types.ts'
import type { ModelEndpoint } from '../types.ts'

export class FetchRequest {
  request: Request
  private modelEndpoint: ModelEndpoint
  private applicationData: ApplicationData
  private fetchClient: typeof fetch
  private logger: Logger
  response: Response
  error?: Error
  private startTime!: number
  private endTime!: number

  constructor(
    request: Request,
    modelEndpoint: ModelEndpoint,
    applicationData: ApplicationData,
  ) {
    this.request = request
    this.modelEndpoint = modelEndpoint
    this.applicationData = applicationData
    this.fetchClient = applicationData.fetchClient
    this.logger = applicationData.logger
    this.response = Response.error()
  }

  async run() {
    try {
      await this.send()
    } catch (error) {
      await this.handleNetworkError(error as Error)
    }

    return this.response
  }

  success() {
    return this.response.ok
  }

  benchmark() {
    return { startTime: this.startTime, endTime: this.endTime }
  }

  async json() {
    return await this.response.json()
  }

  private async send() {
    this.startTime = performance.now()
    this.endTime = performance.now()
    this.response = await this.fetchClient(this.request)
    await this.recordResult()
  }

  private async recordResult() {
    if (this.response.ok) {
      this.endTime = performance.now()
    } else {
      await this.handleFailure()
    }
  }

  private async handleNetworkError(error: Error) {
    this.error = error
    await this.handleFailure()
  }

  private async handleFailure() {
    await new ModelRequestErrorHandler(
      this.modelEndpoint,
      this.applicationData,
      this,
    ).run()
  }
}
export const fetchRequest = async (
  request: Request,
  modelEndpoint: ModelEndpoint,
  applicationData: ApplicationData,
) => {
  const caller = new FetchRequest(request, modelEndpoint, applicationData)
  await caller.run()
  return caller
}
