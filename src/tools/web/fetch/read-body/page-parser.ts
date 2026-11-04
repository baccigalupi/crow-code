import type { FetchedResponse } from '../../../types.ts'
import { HtmlText } from './page-parser/html-text.ts'

export class PageParser {
  private fetched: FetchedResponse
  private body: string

  constructor(fetched: FetchedResponse, body: string) {
    this.fetched = fetched
    this.body = body
  }

  async page() {
    const { url, response } = this.fetched
    const { status } = response
    const contentType = this.contentType()
    return { url, status, contentType, text: await this.text() }
  }

  private contentType() {
    return this.fetched.response.headers.get('content-type') || ''
  }

  private text() {
    if (this.isHtml()) {
      return new HtmlText(this.body).text()
    }

    return this.body
  }

  private isHtml() {
    return /^(text\/html|application\/xhtml\+xml)/.test(this.contentType())
  }
}
