import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { fileMatches } from '../../../../../src/tools/files/read-only/search/file-matches.ts'
import { defaultFilesystem } from '../../../../../src/application-data/filesystem.ts'
import { fixturesDirectory } from '../../../../support/fixtures.ts'

describe('file-matches', () => {
  it('when lines match, returns each match with relative path, line number, and text', async () => {
    const directory = join(fixturesDirectory, 'tools', 'search')

    const matches = await fileMatches({
      directory,
      filesystem: defaultFilesystem(),
      path: 'alpha.txt',
      pattern: /t/,
    }).all()

    expect(matches).toEqual([
      { path: 'alpha.txt', line: 2, text: 'two' },
      { path: 'alpha.txt', line: 3, text: 'three' },
    ])
  })

  it('when context is given, each match carries before and after lines', async () => {
    const directory = join(fixturesDirectory, 'tools', 'search')

    const matches = await fileMatches({
      directory,
      filesystem: defaultFilesystem(),
      path: 'alpha.txt',
      pattern: /t/,
      context: 1,
    }).all()

    expect(matches).toEqual([
      {
        path: 'alpha.txt',
        line: 2,
        text: 'two',
        before: ['one'],
        after: ['three'],
      },
      { path: 'alpha.txt', line: 3, text: 'three', before: ['two'], after: [] },
    ])
  })

  it('when context exceeds file bounds, windows clamp', async () => {
    const directory = join(fixturesDirectory, 'tools', 'search')

    const matches = await fileMatches({
      directory,
      filesystem: defaultFilesystem(),
      path: 'nested/beta.md',
      pattern: /Beta/,
      context: 2,
    }).all()

    expect(matches).toEqual([
      {
        path: 'nested/beta.md',
        line: 1,
        text: '# Beta',
        before: [],
        after: ['', 'two of them'],
      },
    ])
  })

  it('when nothing matches, returns []', async () => {
    const directory = join(fixturesDirectory, 'tools', 'search')

    const matches = await fileMatches({
      directory,
      filesystem: defaultFilesystem(),
      path: 'alpha.txt',
      pattern: /absent/,
    }).all()

    expect(matches).toEqual([])
  })

  it('when the file contains a NUL byte, returns []', async () => {
    const directory = join(fixturesDirectory, 'tools', 'search')

    const matches = await fileMatches({
      directory,
      filesystem: defaultFilesystem(),
      path: 'nested/blob.bin',
      pattern: /ary/,
    }).all()

    expect(matches).toEqual([])
  })

  it('when a global-flag pattern is given, still matches every line', async () => {
    const directory = join(fixturesDirectory, 'tools', 'search')

    const matches = await fileMatches({
      directory,
      filesystem: defaultFilesystem(),
      path: 'alpha.txt',
      pattern: /t/g,
    }).all()

    expect(matches).toHaveLength(2)
  })
})
