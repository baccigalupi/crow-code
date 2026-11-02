import { OperationWithResult } from '../../../operation.ts'
import { UrlCheck } from './url-check.ts'

type TaskArguments = {
  url: string
  signal: AbortSignal
}

export class SendRequest extends OperationWithResult<TaskArguments, Response> {
  protected override logPrefix = 'Send request: '
  private response = new Response(null)

  async run() {
    await this.runSubOperation(this.urlCheck())
    if (this.succeeded) {
      this.response = await this.request()
    }
    return this
  }

  result() {
    return this.response
  }

  private urlCheck() {
    const { applicationData } = this
    const operationArguments = { url: this.operationArguments.url }
    return new UrlCheck({ applicationData, operationArguments })
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
