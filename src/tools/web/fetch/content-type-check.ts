import type { FetchedResponse } from '../../types.ts'
import { Operation } from '../../../operation.ts'

export class ContentTypeCheck extends Operation<FetchedResponse> {
  protected override logPrefix = 'Content type check: '
  private allowed = [
    'text/html',
    'text/plain',
    'text/markdown',
    'application/json',
    'application/xml',
    'text/xml',
  ]

  async run() {
    if (!this.allowed.includes(this.mediaType())) {
      await this.reject()
    }
    return this
  }

  private mediaType() {
    const header = this.operationArguments.response.headers.get('content-type')
    return (header || '').split(';')[0].trim().toLowerCase()
  }

  private async reject() {
    const { url, response } = this.operationArguments
    this.fail(`web fetch content type not allowed: ${this.label()}: ${url}`)
    if (response.body !== null) {
      await response.body.cancel()
    }
  }

  private label() {
    return this.mediaType() || 'none'
  }
}
