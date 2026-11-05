import { TextTidier } from './visible-text/text-tidier.ts'

export class VisibleText {
  private skipDepth = 0
  private collected = ''

  visible() {
    return this.skipDepth === 0
  }

  append(text: string) {
    if (this.visible()) {
      this.collected += text.replace(/[ \t\r\n]+/g, ' ')
    }
  }

  newline() {
    this.collected += '\n'
  }

  skip(element: HTMLRewriterTypes.Element) {
    if (element.canHaveContent) {
      this.skipDepth += 1
      element.onEndTag(() => this.unskip())
    }
  }

  text() {
    return new TextTidier(this.collected).text()
  }

  private unskip() {
    this.skipDepth -= 1
  }
}
