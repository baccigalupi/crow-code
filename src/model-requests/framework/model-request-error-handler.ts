import { createProviderAvailability } from '../../domain/availabilties/create-provider.ts'
import type { ApplicationData } from '../../types.ts'
import type { FetchRequest } from './fetch-request.ts'
import type { ModelEndpoint } from '../types.ts'

export class ModelRequestErrorHandler {
  private modelEndpoint: ModelEndpoint
  private applicationData: ApplicationData
  private apiRequest: FetchRequest

  constructor(
    modelEndpoint: ModelEndpoint,
    applicationData: ApplicationData,
    apiRequest: FetchRequest,
  ) {
    this.modelEndpoint = modelEndpoint
    this.applicationData = applicationData
    this.apiRequest = apiRequest
  }

  async run() {
    if (this.apiRequest.success()) return
    await this.logError()
    await this.recordProviderUnavailableIfNeeded()
  }

  private async logError() {
    if (this.apiRequest.error) {
      this.logNetworkError(this.apiRequest.error)
    } else {
      await this.logApiError()
    }
  }

  private async recordProviderUnavailableIfNeeded() {
    if (this.modelEndpoint.apiKey !== '') return
    await this.recordProviderUnavailable()
  }

  private logNetworkError(error: Error) {
    this.applicationData.logger.error(
      `Error: ${this.apiRequest.request.url} failed to connect: \n${error.message}`,
    )
  }

  private async logApiError() {
    const errorDetails = await this.apiRequest.response.json().catch(() => ({}))
    this.applicationData.logger.error(
      `Error: ${this.apiRequest.request.url} returned ${this.apiRequest.response.status} \n${errorDetails}`,
    )
  }

  private async recordProviderUnavailable() {
    await createProviderAvailability(
      this.applicationData.database,
      this.applicationData.logger,
      { providerId: this.modelEndpoint.providerId, reason: 'no-api-key' },
    ).create()
  }
}
