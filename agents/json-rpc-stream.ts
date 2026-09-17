// Reads and writes LSP messages over a child process' stdio.

type MessageHandler = (message: Record<string, unknown>) => void

export class JsonRpcStream {
  private child: Deno.ChildProcess
  private writer: WritableStreamDefaultWriter<Uint8Array>
  private encoder = new TextEncoder()
  private decoder = new TextDecoder()
  private buffer = ''
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
      this.buffer += this.decoder.decode(chunk)
      this.drain()
    }
  }

  private drain() {
    while (true) {
      const boundary = this.buffer.indexOf('\r\n\r\n')
      if (boundary === -1) {
        return
      }
      const length = this.messageLength(this.buffer.slice(0, boundary))
      if (this.buffer.length < boundary + 4 + length) {
        return
      }
      const body = this.buffer.slice(boundary + 4, boundary + 4 + length)
      this.buffer = this.buffer.slice(boundary + 4 + length)
      this.handle(JSON.parse(body))
    }
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
