import type { ApplicationOperationArguments } from '../../types.ts'
import type { FetchedResponse, WebFetchResult } from '../types.ts'
import { OperationWithResult } from '../../operation.ts'
import { FollowRedirects } from './fetch/follow-redirects.ts'
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

  private fetched: FetchedResponse = { url: '', response: new Response(null) }

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
    const follow = this.followRedirects()
    await this.runSubOperation(follow)
    this.fetched = follow.result()
    if (this.succeeded) {
      await this.accept()
    }
  }

  private followRedirects() {
    const { applicationData, operationArguments } = this
    return new FollowRedirects({ applicationData, operationArguments })
  }

  private async accept() {
    const { url, response } = this.fetched
    if (response.ok) {
      this.page = await this.read()
    } else {
      this.fail(`web fetch failed with status ${response.status}: ${url}`)
    }
  }

  private async read() {
    const { url, response } = this.fetched
    const { status } = response
    const contentType = this.contentType()
    return { url, status, contentType, text: await this.text() }
  }

  private contentType() {
    return this.fetched.response.headers.get('content-type') || ''
  }

  private async text() {
    if (this.isHtml()) {
      return new HtmlText(await this.body()).text()
    }

    return this.body()
  }

  private isHtml() {
    return /^(text\/html|application\/xhtml\+xml)/.test(this.contentType())
  }

  private body() {
    return this.fetched.response.text()
  }

  private failNetwork(error: unknown) {
    const { url } = this.operationArguments
    this.fail(`web fetch failed: ${url} — ${(error as Error).message}`)
  }
}

export const webFetch = (args: WebFetchArguments) => {
  return new WebFetch(args)
}
