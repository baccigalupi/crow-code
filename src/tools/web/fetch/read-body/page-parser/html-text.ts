import { HiddenElement } from './html-text/hidden-element.ts'
import { VisibleText } from './html-text/visible-text.ts'

export class HtmlText {
  private html: string
  private page = new VisibleText()
  private removable = [
    'head',
    'script',
    'style',
    'noscript',
    'svg',
    'iframe',
    'template',
    'object',
    'embed',
    'select',
    'textarea',
    'button',
    'input',
    'img',
  ]
  private blocks = 'p,div,br,li,h1,h2,h3,h4,h5,h6,tr'

  constructor(html: string) {
    this.html = html
  }

  async text() {
    await this.rewriter().transform(new Response(this.html)).text()
    return this.page.text()
  }

  private rewriter() {
    return new HTMLRewriter()
      .on('*', {
        element: (element) => this.inspect(element),
        text: (chunk) => this.page.append(chunk.text),
      })
      .on(this.blocks, { element: () => this.page.newline() })
  }

  private inspect(element: HTMLRewriterTypes.Element) {
    if (this.page.visible()) {
      this.classify(element)
    }
  }

  private classify(element: HTMLRewriterTypes.Element) {
    if (this.isDropped(element)) {
      this.page.skip(element)
    } else if (element.tagName === 'a') {
      this.link(element)
    }
  }

  private isDropped(element: HTMLRewriterTypes.Element) {
    return (
      this.removable.includes(element.tagName) ||
      new HiddenElement(element).hidden()
    )
  }

  private link(element: HTMLRewriterTypes.Element) {
    const href = element.getAttribute('href')
    if (href !== null) {
      element.onEndTag(() => this.page.append(` (${href}) `))
    }
  }
}
