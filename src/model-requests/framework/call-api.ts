import type { Logger } from '../../types.ts'

export class CallApi {
  private request: Request
  private fetchClient: typeof fetch
  private logger: Logger
  private response: Response
  private succeeded: boolean
  error?: Error

  constructor(
    request: Request,
    fetchClient: typeof fetch,
    logger: Logger,
  ) {
    this.request = request
    this.fetchClient = fetchClient
    this.logger = logger
    this.response = Response.error()
    this.succeeded = false
  }

  async perform() {
    try {
      await this.send()
    } catch (error) {
      this.handleNetworkError(error as Error)
    }

    return this.response
  }

  success() {
    return this.succeeded
  }

  private async fetch() {
    this.response = await this.fetchClient(this.request)
  }

  private async send() {
    await this.fetch()
    if (this.response.ok) {
      this.succeeded = true
    } else {
      await this.logApiError()
    }
  }

  private handleNetworkError(error: Error) {
    this.error = error
    this.logger.error(
      `Error: ${this.request.url} failed to connect: \n${error.message}`,
    )
  }

  private async logApiError() {
    const errorDetails = await this.getResponseJson()

    this.logger.error(
      `Error: ${this.request.url} returned ${this.response.status} \n${errorDetails}`,
    )
  }

  private async getResponseJson() {
    try {
      return await this.response.json()
    } catch (error) {
      this.error ||= error as SyntaxError
      this.succeeded = false
      return {}
    }
  }
}

export const callApi = async (
  request: Request,
  fetchClient: typeof fetch,
  logger: Logger,
) => {
  const caller = new CallApi(request, fetchClient, logger)
  await caller.perform()
  return caller
}
