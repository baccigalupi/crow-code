import type { ApplicationData } from '../../application-data.ts'
import type { FetchProviderArguments } from '../types.ts'
import { OperationWithResult } from '../../operation.ts'

export class FetchProvider<ApiRecord, T>
  extends OperationWithResult<FetchProviderArguments<ApiRecord, T>, T[]> {
  protected override logPrefix = 'Fetch provider: '
  private records: T[] = []

  async run() {
    try {
      await this.send()
    } catch {
      this.fail(`Catalog request failed: ${this.operationArguments.url}`)
    }
    return this
  }

  result() {
    return this.records
  }

  private async send() {
    const response = await this.fetch()
    await this.handleResponse(response)
  }

  private async fetch() {
    return await this.applicationData.fetch()(this.operationArguments.url, {
      signal: AbortSignal.timeout(this.operationArguments.timeoutMs),
    })
  }

  private async handleResponse(response: Response) {
    if (response.ok) {
      this.records = this.operationArguments.parse(
        (await response.json()) as ApiRecord,
      )
    } else {
      this.failResponse(response)
    }
  }

  private failResponse(response: Response) {
    this.fail(
      `Catalog request failed with status ${response.status}: ${this.operationArguments.url}`,
    )
  }
}

export const fetchProvider = <ApiRecord, T>(
  applicationData: ApplicationData,
  url: string,
  parse: (raw: ApiRecord) => T[],
  timeoutMs: number,
) => {
  return new FetchProvider<ApiRecord, T>({
    applicationData,
    operationArguments: { url, parse, timeoutMs },
  })
}
