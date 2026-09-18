import type { Logger } from '../types.ts'

class FetchProvider<ApiRecord, T> {
  private url: string
  private parse: (raw: ApiRecord) => T[]
  private timeoutMs: number
  private logger: Logger
  private fetchClient: typeof fetch
  private records: T[] = []

  constructor(
    url: string,
    parse: (raw: ApiRecord) => T[],
    timeoutMs: number,
    logger: Logger,
    fetchClient: typeof fetch = fetch,
  ) {
    this.url = url
    this.parse = parse
    this.timeoutMs = timeoutMs
    this.logger = logger
    this.fetchClient = fetchClient
  }

  async perform() {
    try {
      await this.send()
    } catch {
      this.fail()
    }
    return this.records
  }

  private async send() {
    const response = await this.fetch()
    await this.handleResponse(response)
  }

  private async fetch() {
    return await this.fetchClient(this.url, {
      signal: AbortSignal.timeout(this.timeoutMs),
    })
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      this.logError(response.status)
      return
    }
    this.records = this.parse((await response.json()) as ApiRecord)
  }

  private fail() {
    this.logger.error(`Catalog request failed: ${this.url}`)
  }

  private logError(status: number) {
    this.logger.error(
      `Catalog request failed with status ${status}: ${this.url}`,
    )
  }
}

export const fetchProvider = async <ApiRecord, T>(
  url: string,
  parse: (raw: ApiRecord) => T[],
  timeoutMs: number,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
) => {
  return await new FetchProvider(
    url,
    parse,
    timeoutMs,
    logger,
    fetchClient,
  ).perform()
}
