import type { FetchedResponse } from '../../types.ts'
import { HtmlText } from './html-text.ts'

export class PageReader {
  private fetched: FetchedResponse

  constructor(fetched: FetchedResponse) {
    this.fetched = fetched
  }

  async read() {
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
}
