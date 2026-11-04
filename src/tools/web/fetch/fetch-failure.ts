export class FetchFailure {
  private url: string
  private error: Error

  constructor(url: string, error: unknown) {
    this.url = url
    this.error = error as Error
  }

  reason() {
    if (this.error.name === 'TimeoutError') {
      return this.error.message
    }

    return `web fetch failed: ${this.url} — ${this.error.message}`
  }
}
