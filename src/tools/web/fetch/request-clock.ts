export class RequestClock {
  readonly timeoutMs = 15000
  private controller = new AbortController()
  private timer: Timer | undefined = undefined

  start(url: string) {
    const message = `web fetch timed out after ${this.timeoutMs} ms: ${url}`
    const error = new DOMException(message, 'TimeoutError')
    this.timer = setTimeout(() => this.controller.abort(error), this.timeoutMs)
  }

  signal() {
    return this.controller.signal
  }

  stop() {
    clearTimeout(this.timer)
  }
}
