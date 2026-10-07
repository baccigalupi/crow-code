// Reads and writes LSP messages over a child process' stdio.

type MessageHandler = (message: Record<string, unknown>) => void

export class JsonRpcStream {
  private child: Deno.ChildProcess
  private writer: WritableStreamDefaultWriter<Uint8Array>
  private encoder = new TextEncoder()
  private decoder = new TextDecoder()
  private buffer = new Uint8Array(0)
  private handle: MessageHandler

  constructor(child: Deno.ChildProcess, handle: MessageHandler) {
    this.child = child
    this.writer = child.stdin.getWriter()
    this.handle = handle
  }

  async send(message: Record<string, unknown>) {
    const body = JSON.stringify({ jsonrpc: '2.0', ...message })
    const bytes = this.encoder.encode(body)
    await this.writer.write(
      this.encoder.encode(`Content-Length: ${bytes.length}\r\n\r\n`),
    )
    await this.writer.write(bytes)
  }

  async listen() {
    for await (const chunk of this.child.stdout) {
      this.append(chunk)
      this.drain()
    }
  }

  private append(chunk: Uint8Array) {
    const joined = new Uint8Array(this.buffer.length + chunk.length)
    joined.set(this.buffer)
    joined.set(chunk, this.buffer.length)
    this.buffer = joined
  }

  private drain() {
    while (true) {
      const boundary = this.headerBoundary()
      if (boundary === -1) {
        return
      }
      const length = this.messageLength(
        this.decoder.decode(this.buffer.slice(0, boundary)),
      )
      const end = boundary + 4 + length
      if (this.buffer.length < end) {
        return
      }
      const body = this.decoder.decode(this.buffer.slice(boundary + 4, end))
      this.buffer = this.buffer.slice(end)
      this.handle(JSON.parse(body))
    }
  }

  private headerBoundary() {
    const separator = [13, 10, 13, 10]
    return this.buffer.findIndex((_, index) =>
      separator.every((byte, offset) => this.buffer[index + offset] === byte)
    )
  }

  private messageLength(header: string) {
    const match = /Content-Length: (\d+)/.exec(header)
    if (match === null) {
      return 0
    }
    return Number(match[1])
  }

  stop() {
    this.child.kill()
  }
}
