import { describe, expect, it } from 'bun:test'
import { Languages } from '../../../../src/tools/research/language-parsers/languages.ts'

describe('Languages', () => {
  it('when asked for grammars, returns every language folder grammar', () => {
    const languages = new Languages()

    const grammars = languages.grammars()

    expect(grammars).toHaveLength(3)
    expect(grammars[0].language).toBe('typescript')
    expect(grammars[1].language).toBe('tsx')
    expect(grammars[2].language).toBe('javascript')
  })

  it('when asked for the language parser of a language, returns the parser owning its grammar', () => {
    const languages = new Languages()

    const languageParser = languages.languageParserFor('tsx')

    expect(languageParser.grammars()[1].language).toBe('tsx')
  })
})
