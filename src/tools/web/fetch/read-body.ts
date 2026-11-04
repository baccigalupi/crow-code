import type { FetchedResponse, WebFetchResult } from '../../types.ts'
import { OperationWithResult } from '../../../operation.ts'
import { FetchFailure } from './fetch-failure.ts'
import { PageParser } from './read-body/page-parser.ts'

type BodyReader = ReadableStreamDefaultReader<Uint8Array>

export class ReadBody extends OperationWithResult<
  FetchedResponse,
  WebFetchResult
> {
  protected override logPrefix = 'Read body: '
  private maxBytes = 2097152
  private bytes = 0
  private decoder = new TextDecoder()
  private text = ''
  private page: WebFetchResult = {
    url: '',
    status: 0,
    contentType: '',
    text: '',
  }

  async run() {
    await this.read()
    await this.parse()
    return this
  }

  result() {
    return this.page
  }

  private async read() {
    try {
      await this.readNextChunk(this.stream().getReader())
    } catch (error) {
      this.fail(new FetchFailure(this.operationArguments.url, error).reason())
    }
  }

  private async parse() {
    if (!this.succeeded) return

    this.page = await new PageParser(this.operationArguments, this.text).page()
  }

  private stream() {
    const { body } = this.operationArguments.response
    return body || new ReadableStream({ start: (stream) => stream.close() })
  }

  private async readNextChunk(reader: BodyReader) {
    const { done, value } = await reader.read()
    if (done) {
      this.text += this.decoder.decode()
    } else {
      await this.appendChunk(reader, value)
    }
  }

  private async appendChunk(reader: BodyReader, chunk: Uint8Array) {
    this.bytes += chunk.byteLength
    if (this.bytes > this.maxBytes) {
      await this.cancelOversizedBody(reader)
    } else {
      this.text += this.decoder.decode(chunk, { stream: true })
      await this.readNextChunk(reader)
    }
  }

  private async cancelOversizedBody(reader: BodyReader) {
    await reader.cancel()
    const { url } = this.operationArguments
    this.fail(`web fetch body over ${this.maxBytes} bytes: ${url}`)
  }
}
