import type { Logger } from '../../types.ts'

export class FetchRequest {
  private request: Request
  private fetchClient: typeof fetch
  private logger: Logger
  private response: Response
  private succeeded: boolean
  private startTime!: number
  private endTime!: number
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

  async run() {
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

  benchmark() {
    return { startTime: this.startTime, endTime: this.endTime }
  }

  async json() {
    return await this.response.json()
  }

  private async fetch() {
    this.response = await this.fetchClient(this.request)
  }

  private async send() {
    this.startTime = performance.now()
    this.endTime = performance.now()
    await this.fetch()
    if (this.response.ok) {
      this.endTime = performance.now()
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

export const fetchRequest = async (
  request: Request,
  fetchClient: typeof fetch,
  logger: Logger,
) => {
  const caller = new FetchRequest(request, fetchClient, logger)
  await caller.run()
  return caller
}
