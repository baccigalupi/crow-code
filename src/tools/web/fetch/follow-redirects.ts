import type { FetchedResponse } from '../../types.ts'
import { OperationWithResult } from '../../../operation.ts'
import { RedirectLocation } from './redirect-location.ts'
import { SendRequest } from './send-request.ts'

type TaskArguments = {
  url: string
  response: Response
  signal: AbortSignal
}

export class FollowRedirects extends OperationWithResult<
  TaskArguments,
  FetchedResponse
> {
  protected override logPrefix = 'Follow redirects: '
  private maxRedirects = 5
  private current = ''
  private redirects = 0
  private next = ''
  private fetched: FetchedResponse = { url: '', response: new Response(null) }

  async run() {
    const { url, response } = this.operationArguments
    this.current = url
    await this.land(response)
    return this
  }

  result() {
    return this.fetched
  }

  private async land(response: Response) {
    const location = new RedirectLocation(this.current, response)
    if (location.isRedirect()) {
      this.next = location.target()
      await this.redirect()
    } else {
      this.fetched = { url: this.current, response }
    }
  }

  private async redirect() {
    if (this.redirects >= this.maxRedirects) {
      this.fail(`too many redirects: ${this.next}`)
    } else if (this.downgrades()) {
      this.fail(`redirect downgrades to http: ${this.next}`)
    } else {
      await this.hop()
    }
  }

  private async hop() {
    this.redirects += 1
    this.current = this.next
    const request = this.sendRequest()
    await this.runSubOperation(request)
    if (this.succeeded) {
      await this.land(request.result())
    }
  }

  private sendRequest() {
    const { applicationData } = this
    const { signal } = this.operationArguments
    const operationArguments = { url: this.current, signal }
    return new SendRequest({ applicationData, operationArguments })
  }

  private downgrades() {
    return this.current.startsWith('https:') && this.next.startsWith('http:')
  }
}
