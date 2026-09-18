import type { Logger } from '../model-info/types.ts'

export class ApiRequest<T> {
  private request: Request
  private fetchClient: typeof fetch
  private parse: (response: Response) => Promise<T>
  private logger: Logger
  private response: Response

  constructor(
    request: Request,
    fetchClient: typeof fetch,
    parse: (response: Response) => Promise<T>,
    logger: Logger,
  ) {
    this.request = request
    this.fetchClient = fetchClient
    this.parse = parse
    this.logger = logger
    this.response = Response.error()
  }

  async perform() {
    try {
      await this.send()
    } catch {
      this.fail()
    }
    return await this.parse(this.response)
  }

  private async fetch() {
    this.response = await this.fetchClient(this.request)
  }

  private async send() {
    await this.fetch()
    this.logError()
  }

  private fail() {
    this.logger.error(`Error: ${this.request.url} failed to connect`)
    this.response = Response.error()
  }

  private logError() {
    if (!this.response.ok) {
      this.logger.error(
        `Error: ${this.request.url} returned ${this.response.status}`,
      )
    }
  }
}
