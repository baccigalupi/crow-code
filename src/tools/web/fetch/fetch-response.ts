import type { FetchedResponse } from '../../types.ts'
import { OperationWithResult } from '../../../operation.ts'
import { FollowRedirects } from './fetch-response/follow-redirects.ts'
import { RedirectLocation } from './fetch-response/redirect-location.ts'
import { SendRequest } from './fetch-response/send-request.ts'

type TaskArguments = {
  url: string
  signal: AbortSignal
}

export class FetchResponse extends OperationWithResult<
  TaskArguments,
  FetchedResponse
> {
  protected override logPrefix = 'Fetch response: '
  private fetched: FetchedResponse = { url: '', response: new Response(null) }

  async run() {
    const { applicationData, operationArguments } = this
    const request = new SendRequest({ applicationData, operationArguments })
    await this.runSubOperation(request)
    this.fetched = { url: operationArguments.url, response: request.result() }
    await this.followIfRedirected()
    return this
  }

  result() {
    return this.fetched
  }

  private async followIfRedirected() {
    const { url, response } = this.fetched
    if (new RedirectLocation(url, response).isRedirect()) {
      await this.follow()
    }
  }

  private async follow() {
    const { applicationData } = this
    const { url, response } = this.fetched
    const { signal } = this.operationArguments
    const operationArguments = { url, response, signal }
    const follow = new FollowRedirects({ applicationData, operationArguments })
    await this.runSubOperation(follow)
    this.fetched = follow.result()
  }
}
