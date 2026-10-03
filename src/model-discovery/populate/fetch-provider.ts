import type { ApplicationData } from '../../application-data.ts'

class FetchProvider<ApiRecord, T> {
  private applicationData: ApplicationData
  private url: string
  private parse: (raw: ApiRecord) => T[]
  private timeoutMs: number
  private records: T[] = []

  constructor(
    applicationData: ApplicationData,
    url: string,
    parse: (raw: ApiRecord) => T[],
    timeoutMs: number,
  ) {
    this.applicationData = applicationData
    this.url = url
    this.parse = parse
    this.timeoutMs = timeoutMs
  }

  async run() {
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
    return await this.applicationData.fetch()(this.url, {
      signal: AbortSignal.timeout(this.timeoutMs),
    })
  }

  private async handleResponse(response: Response) {
    if (response.ok) {
      this.records = this.parse((await response.json()) as ApiRecord)
    } else {
      this.logError(response.status)
    }
  }

  private fail() {
    this.applicationData.logger().error(`Catalog request failed: ${this.url}`)
  }

  private logError(status: number) {
    this.applicationData.logger().error(
      `Catalog request failed with status ${status}: ${this.url}`,
    )
  }
}

export const fetchProvider = async <ApiRecord, T>(
  applicationData: ApplicationData,
  url: string,
  parse: (raw: ApiRecord) => T[],
  timeoutMs: number,
) => {
  return await new FetchProvider(
    applicationData,
    url,
    parse,
    timeoutMs,
  ).run()
}
