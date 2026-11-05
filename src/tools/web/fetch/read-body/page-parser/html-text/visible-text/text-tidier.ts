export class TextTidier {
  private collected: string
  private entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  }

  constructor(collected: string) {
    this.collected = collected
  }

  text() {
    return this.decoded()
      .replace(/ +/g, ' ')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '')
      .join('\n')
  }

  private decoded() {
    return this.collected.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => {
      return this.entities[entity]
    })
  }
}
