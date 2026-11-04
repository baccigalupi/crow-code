export class HtmlText {
  private html: string
  private skipDepth = 0
  private collected = ''
  private skipped = 'head,script,style'
  private blocks = 'p,div,br,li,h1,h2,h3,h4,h5,h6,tr'
  private entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  }

  constructor(html: string) {
    this.html = html
  }

  async text() {
    const rewriter = new HTMLRewriter()
      .on(this.skipped, { element: (element) => this.skip(element) })
      .on(this.blocks, { element: () => this.newline() })
      .on('*', { text: (chunk) => this.append(chunk.text) })
    await rewriter.transform(new Response(this.html)).text()
    return this.tidy()
  }

  private skip(element: HTMLRewriterTypes.Element) {
    this.skipDepth += 1
    element.onEndTag(() => this.unskip())
  }

  private unskip() {
    this.skipDepth -= 1
  }

  private newline() {
    this.collected += '\n'
  }

  private append(text: string) {
    if (this.skipDepth === 0) {
      this.collected += text.replace(/[ \t\r\n]+/g, ' ')
    }
  }

  private tidy() {
    return this.decode(this.collected)
      .replace(/ +/g, ' ')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '')
      .join('\n')
  }

  private decode(text: string) {
    return text.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => {
      return this.entities[entity]
    })
  }
}
