import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { fileMatches } from '../../../../src/tools/files/search/file-matches.ts'
import { fixturesDirectory } from '../../../support/fixtures.ts'

describe('file-matches', () => {
  it('when lines match, returns each match with relative path, line number, and text', async () => {
    const root = join(fixturesDirectory, 'tools', 'search')

    const matches = await fileMatches({ root, path: 'alpha.txt', pattern: /t/ })
      .all()

    expect(matches).toEqual([
      { path: 'alpha.txt', line: 2, text: 'two' },
      { path: 'alpha.txt', line: 3, text: 'three' },
    ])
  })

  it('when nothing matches, returns []', async () => {
    const root = join(fixturesDirectory, 'tools', 'search')

    const matches = await fileMatches({
      root,
      path: 'alpha.txt',
      pattern: /absent/,
    }).all()

    expect(matches).toEqual([])
  })

  it('when the file contains a NUL byte, returns []', async () => {
    const root = join(fixturesDirectory, 'tools', 'search')

    const matches = await fileMatches({
      root,
      path: 'nested/blob.bin',
      pattern: /ary/,
    }).all()

    expect(matches).toEqual([])
  })

  it('when a global-flag pattern is given, still matches every line', async () => {
    const root = join(fixturesDirectory, 'tools', 'search')

    const matches = await fileMatches({
      root,
      path: 'alpha.txt',
      pattern: /t/g,
    }).all()

    expect(matches).toHaveLength(2)
  })
})
