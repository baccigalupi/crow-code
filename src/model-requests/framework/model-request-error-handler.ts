import { APIError } from 'openai'
import { createProviderAvailability } from '../../domain/availabilties/create-provider.ts'
import { requestLogger } from './request-logger.ts'
import type { ApplicationData } from '../../application-data.ts'
import type { ModelEndpoint } from '../types.ts'

export class ModelRequestErrorHandler {
  private applicationData: ApplicationData
  private modelEndpoint: ModelEndpoint
  private url: string
  private error: Error

  constructor(
    applicationData: ApplicationData,
    modelEndpoint: ModelEndpoint,
    url: string,
    error: Error,
  ) {
    this.applicationData = applicationData
    this.modelEndpoint = modelEndpoint
    this.url = url
    this.error = error
  }

  async run() {
    await this.handleApiError()
    this.handleNetworkError()
  }

  private requestLogger() {
    return requestLogger(this.applicationData.logger(), this.url, this.error)
  }

  private async handleApiError() {
    if (!this.isApiError()) return
    this.logApiError()
    await this.recordProviderUnavailableIfNeeded()
  }

  private isApiError() {
    return this.error instanceof APIError && this.error.status !== undefined
  }

  private logApiError() {
    this.requestLogger().apiError()
  }

  private handleNetworkError() {
    if (this.isApiError()) return
    this.requestLogger().networkError()
  }

  private async recordProviderUnavailableIfNeeded() {
    if (this.modelEndpoint.apiKey !== '') return
    await this.recordProviderUnavailable()
  }

  private async recordProviderUnavailable() {
    await createProviderAvailability(this.applicationData, {
      providerId: this.modelEndpoint.providerId,
      reason: 'no-api-key',
    }).run()
  }
}
