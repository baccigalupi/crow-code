export class TextNormalizer {
  private original: string
  private limit = 50000
  private marker = '[truncated]'

  constructor(text: string) {
    this.original = text
  }

  text() {
    if (this.withinLimit()) {
      return this.normalized()
    }

    return this.normalized().slice(0, this.limit) + this.marker
  }

  private withinLimit() {
    return this.normalized().length <= this.limit
  }

  private normalized() {
    return this.original.replace(/\p{Cf}/gu, '').normalize('NFKC')
  }
}
