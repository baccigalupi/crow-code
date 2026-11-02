export class RequestClock {
  readonly timeoutMs = 15000
  private controller = new AbortController()
  private timer: Timer | undefined = undefined

  start() {
    const error = new DOMException('timed out', 'TimeoutError')
    this.timer = setTimeout(() => this.controller.abort(error), this.timeoutMs)
  }

  signal() {
    return this.controller.signal
  }

  stop() {
    clearTimeout(this.timer)
  }
}
