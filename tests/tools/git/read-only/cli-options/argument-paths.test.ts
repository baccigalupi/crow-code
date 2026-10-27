import { describe, expect, it } from 'bun:test'
import { GitArgumentPaths } from '../../../../../src/tools/git/read-only/cli-options/argument-paths.ts'

describe('GitArgumentPaths', () => {
  it('when all three sources have paths, lists positionals, flag paths, then pathspecs', () => {
    const paths = new GitArgumentPaths({
      positionals: ['HEAD~3', 'origin/main'],
      flagPaths: ['notes.txt'],
      pathspecs: ['src/a.ts'],
    })

    const result = paths.paths()

    expect(result).toEqual(['HEAD~3', 'origin/main', 'notes.txt', 'src/a.ts'])
  })

  it('when a path appears more than once, lists it once', () => {
    const paths = new GitArgumentPaths({
      positionals: ['src/a.ts'],
      flagPaths: [],
      pathspecs: ['src/a.ts'],
    })

    const result = paths.paths()

    expect(result).toEqual(['src/a.ts'])
  })

  it('when a positional is rev:path, lists the revision and the path', () => {
    const paths = new GitArgumentPaths({
      positionals: ['abc123:src/a.ts'],
      flagPaths: [],
      pathspecs: [],
    })

    const result = paths.paths()

    expect(result).toEqual(['abc123', 'src/a.ts'])
  })

  it('when a rev:path path escapes, lists the escaping path', () => {
    const paths = new GitArgumentPaths({
      positionals: ['abc123:../x'],
      flagPaths: [],
      pathspecs: [],
    })

    const result = paths.paths()

    expect(result).toEqual(['abc123', '../x'])
  })

  it('when a positional starts with a colon, keeps it whole', () => {
    const paths = new GitArgumentPaths({
      positionals: [':0:src/a.ts'],
      flagPaths: [],
      pathspecs: [],
    })

    const result = paths.paths()

    expect(result).toEqual([':0:src/a.ts'])
  })
})
