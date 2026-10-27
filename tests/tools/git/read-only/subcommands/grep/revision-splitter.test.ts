import { describe, expect, it } from 'bun:test'
import { GitGrepRevisionSplitter } from '../../../../../../src/tools/git/read-only/subcommands/grep/revision-splitter.ts'

describe('GitGrepRevisionSplitter', () => {
  it('when the line starts with a searched revision, adds the revision and builds from the rest', () => {
    const splitter = new GitGrepRevisionSplitter(['-e', 'a', 'HEAD'])

    const result = splitter.split('HEAD:allowed.txt:1', (rest) => ({ rest }))

    expect(result).toEqual({ revision: 'HEAD', rest: 'allowed.txt:1' })
  })

  it('when the line does not start with a searched revision, builds from the whole line', () => {
    const splitter = new GitGrepRevisionSplitter(['-e', 'a', 'HEAD'])

    const result = splitter.split('allowed.txt:1', (rest) => ({ rest }))

    expect(result).toEqual({ rest: 'allowed.txt:1' })
  })

  it('when the line starts with the -e pattern, does not take it as a revision', () => {
    const splitter = new GitGrepRevisionSplitter(['-e', 'allowed'])

    const result = splitter.split('allowed:1', (rest) => ({ rest }))

    expect(result).toEqual({ rest: 'allowed:1' })
  })
})
