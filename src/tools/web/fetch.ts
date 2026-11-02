import type { ApplicationOperationArguments } from '../../types.ts'
import type { FetchedResponse, WebFetchResult } from '../types.ts'
import { OperationWithResult } from '../../operation.ts'
import { FetchResponse } from './fetch/fetch-response.ts'
import { PageReader } from './fetch/page-reader.ts'
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
    this.clock.start()
    await this.attempt()
    this.clock.stop()
    return this
  }

  private async attempt() {
    try {
      await this.send()
    } catch (error) {
      this.failNetwork(error)
    }
  }

  result() {
    return this.page
  }

  private async send() {
    const response = this.fetchResponse()
    await this.runSubOperation(response)
    this.fetched = response.result()
    if (this.succeeded) {
      await this.accept()
    }
  }

  private fetchResponse() {
    const { applicationData } = this
    const { url } = this.operationArguments
    const operationArguments = { url, signal: this.clock.signal() }
    return new FetchResponse({ applicationData, operationArguments })
  }

  private async accept() {
    const { url, response } = this.fetched
    if (response.ok) {
      this.page = await new PageReader(this.fetched).read()
    } else {
      this.fail(`web fetch failed with status ${response.status}: ${url}`)
    }
  }

  private failNetwork(error: unknown) {
    const { url } = this.operationArguments
    const { name, message } = error as Error
    if (name === 'TimeoutError') {
      this.fail(`web fetch timed out after ${this.clock.timeoutMs} ms: ${url}`)
    } else {
      this.fail(`web fetch failed: ${url} — ${message}`)
    }
  }
}

export const webFetch = (args: WebFetchArguments) => {
  return new WebFetch(args)
}
