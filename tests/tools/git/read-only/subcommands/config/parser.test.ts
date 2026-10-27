import { describe, expect, it } from 'bun:test'
import { GitConfigParser } from '../../../../../../src/tools/git/read-only/subcommands/config/parser.ts'

describe('GitConfigParser', () => {
  it('when given --list output, returns key and value entries', () => {
    const parser = new GitConfigParser(
      'core.bare=false\ncore.ignorecase=true\n',
      '--list',
    )

    const result = parser.parse()

    expect(result).toEqual({
      entries: [
        { key: 'core.bare', value: 'false' },
        { key: 'core.ignorecase', value: 'true' },
      ],
    })
  })

  it('when given -l output, returns key and value entries', () => {
    const parser = new GitConfigParser('core.bare=false\n', '-l')

    const result = parser.parse()

    expect(result).toEqual({ entries: [{ key: 'core.bare', value: 'false' }] })
  })

  it('when given --get-regexp output, splits key and value at the first space', () => {
    const parser = new GitConfigParser('core.ignorecase true\n', '--get-regexp')

    const result = parser.parse()

    expect(result).toEqual({
      entries: [{ key: 'core.ignorecase', value: 'true' }],
    })
  })

  it('when given --get output, returns values', () => {
    const parser = new GitConfigParser('false\n', '--get')

    const result = parser.parse()

    expect(result).toEqual({ values: ['false'] })
  })

  it('when given --get-all output, returns every value', () => {
    const parser = new GitConfigParser('false\ntrue\n', '--get-all')

    const result = parser.parse()

    expect(result).toEqual({ values: ['false', 'true'] })
  })
})
