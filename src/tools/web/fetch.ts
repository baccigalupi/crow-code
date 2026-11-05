import type { ApplicationOperationArguments } from '../../types.ts'
import type { FetchedResponse, WebFetchResult } from '../types.ts'
import { OperationWithResult } from '../../operation.ts'
import { ContentTypeCheck } from './fetch/content-type-check.ts'
import { FetchResponse } from './fetch/fetch-response.ts'
import { ReadBody } from './fetch/read-body.ts'
import { RequestClock } from './fetch/request-clock.ts'

type TaskArguments = {
  url: string
}

type WebFetchArguments = ApplicationOperationArguments<TaskArguments>

export class WebFetch extends OperationWithResult<
  TaskArguments,
  WebFetchResult
> {
  protected override logPrefix = 'Web fetch: '
  private page: WebFetchResult = {
    url: '',
    status: 0,
    contentType: '',
    text: '',
  }

  private fetched: FetchedResponse = { url: '', response: new Response(null) }

  private clock = new RequestClock()

  async run() {
    this.clock.start(this.operationArguments.url)
    await this.fetchResponse()
    await this.checkContentType()
    await this.readPage()
    this.reportError()
    this.clock.stop()
    return this
  }

  result() {
    return this.page
  }

  private reportError() {
    const { url, response: fetchedResponse } = this.fetched
    if (this.succeeded && !fetchedResponse.ok) {
      this.fail(
        `web fetch failed with status ${fetchedResponse.status}: ${url}`,
      )
    }
  }

  private async fetchResponse() {
    const { applicationData } = this
    const { url } = this.operationArguments
    const operationArguments = { url, signal: this.clock.signal() }
    const response = new FetchResponse({ applicationData, operationArguments })
    await this.runSubOperation(response)
    this.fetched = response.result()
  }

  private async checkContentType() {
    if (!this.succeeded || !this.fetched.response.ok) return

    const { applicationData } = this
    const operationArguments = this.fetched
    const check = new ContentTypeCheck({ applicationData, operationArguments })
    await this.runSubOperation(check)
  }

  private async readPage() {
    if (!this.succeeded || !this.fetched.response.ok) return

    const { applicationData } = this
    const operationArguments = this.fetched
    const body = new ReadBody({ applicationData, operationArguments })
    await this.runSubOperation(body)
    this.page = body.result()
  }
}

export const webFetch = (args: WebFetchArguments) => {
  return new WebFetch(args)
}
