import type { ApplicationOperationArguments } from '../../types.ts'
import type { WebFetchResult } from '../types.ts'
import { OperationWithResult } from '../../operation.ts'
import { HtmlText } from './fetch/html-text.ts'

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

  async run() {
    try {
      await this.send()
    } catch (error) {
      this.failNetwork(error)
    }
    return this
  }

  result() {
    return this.page
  }

  private async send() {
    const { url } = this.operationArguments
    const response = await this.applicationData.fetch()(url)
    if (response.ok) {
      this.page = await this.read(response)
    } else {
      this.fail(`web fetch failed with status ${response.status}: ${url}`)
    }
  }

  private async read(response: Response) {
    const contentType = response.headers.get('content-type') || ''
    const body = await response.text()
    const text = await this.visibleText(contentType, body)
    const { url } = this.operationArguments
    return { url, status: response.status, contentType, text }
  }

  private visibleText(contentType: string, body: string) {
    if (/^(text\/html|application\/xhtml\+xml)/.test(contentType)) {
      return new HtmlText(body).text()
    }

    return body
  }

  private failNetwork(error: unknown) {
    const { url } = this.operationArguments
    this.fail(`web fetch failed: ${url} — ${(error as Error).message}`)
  }
}

export const webFetch = (args: WebFetchArguments) => {
  return new WebFetch(args)
}
