import { OperationWithResult } from '../../../../operation.ts'
import { FetchFailure } from '../fetch-failure.ts'
import { UrlCheck } from './send-request/url-check.ts'

type TaskArguments = {
  url: string
  signal: AbortSignal
}

export class SendRequest extends OperationWithResult<TaskArguments, Response> {
  protected override logPrefix = 'Send request: '
  private response = new Response(null)

  async run() {
    await this.urlCheck()
    await this.fetch()
    return this
  }

  result() {
    return this.response
  }

  private async fetch() {
    if (!this.succeeded) return

    try {
      this.response = await this.request()
    } catch (error) {
      this.fail(new FetchFailure(this.operationArguments.url, error).reason())
    }
  }

  private async urlCheck() {
    const { applicationData } = this
    const operationArguments = { url: this.operationArguments.url }
    await this.runSubOperation(
      new UrlCheck({ applicationData, operationArguments }),
    )
  }

  private request() {
    const { url, signal } = this.operationArguments
    return this.applicationData.fetch()(url, {
      redirect: 'manual',
      credentials: 'omit',
      headers: { 'user-agent': 'crow' },
      signal,
    })
  }
}
