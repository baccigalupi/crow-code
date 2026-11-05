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

  it('when the page has non-content elements, drops them', async () => {
    const html =
      '<p>a</p><noscript>x</noscript><svg><text>y</text></svg><iframe>z</iframe><template>t</template><object>o</object><select><option>s</option></select><textarea>u</textarea><button>b</button><input name="q"><p>c</p>'

    const text = await new HtmlText(html).text()

    expect(text).toBe('a\nc')
  })

  it('when an element has the hidden attribute, drops it and its children', async () => {
    const html = '<p>a</p><div hidden><p>x</p></div><p>c</p>'

    const text = await new HtmlText(html).text()

    expect(text).toBe('a\nc')
  })

  it('when an element has aria-hidden true, drops it', async () => {
    const html =
      '<p>a</p><p aria-hidden="true">x</p><p aria-hidden="false">c</p>'

    const text = await new HtmlText(html).text()

    expect(text).toBe('a\nc')
  })

  it('when an element has a hiding inline style, drops it', async () => {
    const html =
      '<p style="display: none">a</p><p style="VISIBILITY:hidden">b</p><p style="font-size:0px">c</p><p style="opacity:0">d</p><p style="font-size:0.8em">e</p>'

    const text = await new HtmlText(html).text()

    expect(text).toBe('e')
  })

  it('when a link has an href, renders the text followed by the url', async () => {
    const html = '<p>see <a href="https://192.0.2.1/x">docs</a> now</p>'

    const text = await new HtmlText(html).text()

    expect(text).toBe('see docs (https://192.0.2.1/x) now')
  })

  it('when a link has no href, renders only its text', async () => {
    const html = '<a>docs</a>'

    const text = await new HtmlText(html).text()

    expect(text).toBe('docs')
  })

  it('when the page has images and comments, drops them with the alt text', async () => {
    const html = '<p>a<img src="x" alt="b"><!-- c --></p>'

    const text = await new HtmlText(html).text()

    expect(text).toBe('a')
  })

  it('when the source has indentation and runs of spaces, collapses them', async () => {
    const html = '<p>\n    a    b\n  </p>'

    const text = await new HtmlText(html).text()

    expect(text).toBe('a b')
  })
})
