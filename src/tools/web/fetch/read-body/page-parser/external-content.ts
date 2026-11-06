export class ExternalContent {
  private source: string
  private original: string

  constructor(source: string, text: string) {
    this.source = source
    this.original = text
  }

  text() {
    return `${this.open()}\n${this.escaped()}\n${this.close()}`
  }

  private escaped() {
    return this.original.replace(
      /<(\/?)external_content/gi,
      '&lt;$1external_content',
    )
  }

  private open() {
    return `<external_content source="${this.quoted()}">`
  }

  private quoted() {
    return this.source.replaceAll('"', '&quot;')
  }

  private close() {
    return '</external_content>'
  }
}
