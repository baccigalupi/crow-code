import type { FetchedResponse } from '../../types.ts'
import { OperationWithResult } from '../../../operation.ts'
import { UrlCheck } from './url-check.ts'

type TaskArguments = {
  url: string
}

export class FollowRedirects extends OperationWithResult<
  TaskArguments,
  FetchedResponse
> {
  protected override logPrefix = 'Follow redirects: '
  private maxRedirects = 5
  private redirectStatuses = [301, 302, 303, 307, 308]
  private current = ''
  private redirects = 0
  private response = new Response(null)
  private next = ''
  private fetched: FetchedResponse = { url: '', response: new Response(null) }

  async run() {
    this.current = this.operationArguments.url
    await this.follow()
    return this
  }

  result() {
    return this.fetched
  }

  private async follow() {
    await this.runSubOperation(this.urlCheck())
    if (this.succeeded) {
      await this.send()
    }
  }

  private urlCheck() {
    const { applicationData } = this
    const operationArguments = { url: this.current }
    return new UrlCheck({ applicationData, operationArguments })
  }

  private async send() {
    this.response = await this.request()
    this.next = this.location()
    if (this.next === '') {
      this.fetched = { url: this.current, response: this.response }
    } else {
      await this.redirect()
    }
  }

  private request() {
    return this.applicationData.fetch()(this.current, { redirect: 'manual' })
  }

  private location() {
    if (!this.isRedirect()) {
      return ''
    }

    const location = this.response.headers.get('location') as string
    return new URL(location, this.current).href
  }

  private isRedirect() {
    return (
      this.redirectStatuses.includes(this.response.status) &&
      this.response.headers.has('location')
    )
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
    await this.follow()
  }

  private downgrades() {
    return this.current.startsWith('https:') && this.next.startsWith('http:')
  }
}
