import { describe, expect, it } from 'bun:test'
import { TextTidier } from '../../../../../../../../src/tools/web/fetch/read-body/page-parser/html-text/visible-text/text-tidier.ts'

describe('TextTidier', () => {
  it('when the text has entities, decodes them', () => {
    const collected = 'a &amp; b &lt; c &#39;d&#39; &nbsp;e'

    const text = new TextTidier(collected).text()

    expect(text).toBe("a & b < c 'd' e")
  })

  it('when the text has blank lines and padding, trims them', () => {
    const collected = '\n  a  \n\n b   c\n'

    const text = new TextTidier(collected).text()

    expect(text).toBe('a\nb c')
  })
})
