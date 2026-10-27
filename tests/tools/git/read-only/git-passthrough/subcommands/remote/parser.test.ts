import { describe, expect, it } from 'bun:test'
import { GitRemoteParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/remote/parser.ts'

describe('GitRemoteParser', () => {
  it('when given remote output, returns names', () => {
    const parser = new GitRemoteParser('origin\n', '')

    const result = parser.parse()

    expect(result).toEqual({ entries: [{ name: 'origin' }] })
  })

  it('when given remote -v output, returns urls and directions', () => {
    const parser = new GitRemoteParser(
      'origin\thttps://example.com/fixture.git (fetch)\norigin\thttps://example.com/fixture.git (push)\n',
      '-v',
    )

    const result = parser.parse()

    expect(result).toEqual({
      entries: [
        {
          name: 'origin',
          url: 'https://example.com/fixture.git',
          direction: 'fetch',
        },
        {
          name: 'origin',
          url: 'https://example.com/fixture.git',
          direction: 'push',
        },
      ],
    })
  })

  it('when given get-url output, returns the url', () => {
    const parser = new GitRemoteParser(
      'https://example.com/fixture.git\n',
      'get-url',
    )

    const result = parser.parse()

    expect(result).toEqual({ url: 'https://example.com/fixture.git' })
  })
})
