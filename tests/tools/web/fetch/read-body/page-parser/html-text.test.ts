import { describe, expect, it } from 'bun:test'
import { HtmlText } from '../../../../../../src/tools/web/fetch/read-body/page-parser/html-text.ts'

describe('HtmlText', () => {
  it('when given a document, returns only body text', async () => {
    const html =
      '<html><head><title>T</title><style>p{}</style></head><body><p>Hello</p><script>x()</script></body></html>'

    const text = await new HtmlText(html).text()

    expect(text).toBe('Hello')
  })

  it('when the text has entities, decodes them', async () => {
    const html = '<p>a &amp; b &lt; c &#39;d&#39; &nbsp;e</p>'

    const text = await new HtmlText(html).text()

    expect(text).toBe("a & b < c 'd' e")
  })

  it('when the page has several paragraphs, separates them with newlines', async () => {
    const html = '<p>a</p><p>b</p><div>c</div>'

    const text = await new HtmlText(html).text()

    expect(text).toBe('a\nb\nc')
  })

  it('when the source has indentation and runs of spaces, collapses them', async () => {
    const html = '<p>\n    a    b\n  </p>'

    const text = await new HtmlText(html).text()

    expect(text).toBe('a b')
  })
})
