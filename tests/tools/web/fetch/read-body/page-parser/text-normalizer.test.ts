import { describe, expect, it } from 'bun:test'
import { TextNormalizer } from '../../../../../../src/tools/web/fetch/read-body/page-parser/text-normalizer.ts'

describe('TextNormalizer', () => {
  it('when the text has format characters, removes them', () => {
    const input = 'a​b‮c\u{E0041}d'

    const text = new TextNormalizer(input).text()

    expect(text).toBe('abcd')
  })

  it('when the text has compatibility characters, normalizes them', () => {
    const input = 'ﬁ①'

    const text = new TextNormalizer(input).text()

    expect(text).toBe('fi1')
  })

  it('when the text is over 50,000 characters, truncates and marks it', () => {
    const input = 'a'.repeat(50001)

    const text = new TextNormalizer(input).text()

    expect(text.length).toBe(50011)
    expect(text.endsWith('aaa[truncated]')).toBe(true)
  })
})
