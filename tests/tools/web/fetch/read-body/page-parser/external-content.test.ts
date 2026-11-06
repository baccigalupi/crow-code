import { describe, expect, it } from 'bun:test'
import { ExternalContent } from '../../../../../../src/tools/web/fetch/read-body/page-parser/external-content.ts'

describe('ExternalContent', () => {
  it('when text is plain, wraps it with its source', () => {
    const content = new ExternalContent('https://192.0.2.1/a', 'hello')

    const text = content.text()

    expect(text).toBe(
      '<external_content source="https://192.0.2.1/a">\nhello\n</external_content>',
    )
  })

  it('when text has a closing tag in any case, escapes it', () => {
    const content = new ExternalContent(
      'https://192.0.2.1/a',
      'a </EXTERNAL_CONTENT> b',
    )

    const text = content.text()

    expect(text).toBe(
      '<external_content source="https://192.0.2.1/a">\na &lt;/external_content> b\n</external_content>',
    )
  })

  it('when text has an opening tag in any case, escapes it', () => {
    const content = new ExternalContent(
      'https://192.0.2.1/a',
      '<External_Content source="x">',
    )

    const text = content.text()

    expect(text).toBe(
      '<external_content source="https://192.0.2.1/a">\n&lt;external_content source="x">\n</external_content>',
    )
  })

  it('when the source has a quote, escapes it', () => {
    const content = new ExternalContent('https://192.0.2.1/a"b', 'hello')

    const text = content.text()

    expect(text).toBe(
      '<external_content source="https://192.0.2.1/a&quot;b">\nhello\n</external_content>',
    )
  })
})
