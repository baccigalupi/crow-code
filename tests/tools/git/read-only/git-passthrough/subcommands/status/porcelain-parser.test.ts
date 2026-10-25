import { describe, expect, it } from 'bun:test'
import { GitStatusPorcelainParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/status/porcelain-parser.ts'

describe('GitStatusPorcelainParser', () => {
  it('when options include --porcelain=v2, matches', () => {
    const parser = new GitStatusPorcelainParser(['--porcelain=v2', '-b'])

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options include --porcelain=v2 and -s, does not match', () => {
    const parser = new GitStatusPorcelainParser(['--porcelain=v2', '-s'])

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when options do not include --porcelain=v2, does not match', () => {
    const parser = new GitStatusPorcelainParser(['-b'])

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when a file is modified in the worktree, returns its states', () => {
    const parser = new GitStatusPorcelainParser(['--porcelain=v2'])

    const result = parser.parse(
      '1 .M N... 100644 100644 100644 4e84e5c 4e84e5c notes.txt\n',
    )

    expect(result).toEqual({
      changes: [
        { path: 'notes.txt', index: 'unmodified', worktree: 'modified' },
      ],
    })
  })

  it('when files are staged as added and deleted in the worktree, returns their states', () => {
    const parser = new GitStatusPorcelainParser(['--porcelain=v2'])

    const result = parser.parse(
      '1 A. N... 000000 100644 100644 0000000 fe4e092 staged.txt\n1 .D N... 100644 100644 000000 104cacf 104cacf gone.txt\n',
    )

    expect(result).toEqual({
      changes: [
        { path: 'staged.txt', index: 'added', worktree: 'unmodified' },
        { path: 'gone.txt', index: 'unmodified', worktree: 'deleted' },
      ],
    })
  })

  it('when a file has a type change and a copy, returns their states', () => {
    const parser = new GitStatusPorcelainParser(['--porcelain=v2'])

    const result = parser.parse(
      '1 T. N... 100644 120000 120000 104cacf 9a1b2c3 link.txt\n2 C. N... 100644 100644 100644 104cacf 104cacf C100 copy.txt\tsource.txt\n',
    )

    expect(result).toEqual({
      changes: [
        { path: 'link.txt', index: 'typeChanged', worktree: 'unmodified' },
        {
          path: 'copy.txt',
          oldPath: 'source.txt',
          index: 'copied',
          worktree: 'unmodified',
        },
      ],
    })
  })

  it('when a file is renamed, returns its new and old paths', () => {
    const parser = new GitStatusPorcelainParser(['--porcelain=v2'])

    const result = parser.parse(
      '2 R. N... 100644 100644 100644 104cacf 104cacf R100 renamed.txt\tdenied.txt\n',
    )

    expect(result).toEqual({
      changes: [
        {
          path: 'renamed.txt',
          oldPath: 'denied.txt',
          index: 'renamed',
          worktree: 'unmodified',
        },
      ],
    })
  })

  it('when a path contains spaces, returns the whole path', () => {
    const parser = new GitStatusPorcelainParser(['--porcelain=v2'])

    const result = parser.parse(
      '1 .M N... 100644 100644 100644 4e84e5c 4e84e5c my notes.txt\n',
    )

    expect(result).toEqual({
      changes: [
        { path: 'my notes.txt', index: 'unmodified', worktree: 'modified' },
      ],
    })
  })

  it('when a file is untracked, returns untracked states', () => {
    const parser = new GitStatusPorcelainParser(['--porcelain=v2'])

    const result = parser.parse('? untracked.txt\n')

    expect(result).toEqual({
      changes: [
        { path: 'untracked.txt', index: 'untracked', worktree: 'untracked' },
      ],
    })
  })

  it('when a file is unmerged, returns unmerged states', () => {
    const parser = new GitStatusPorcelainParser(['--porcelain=v2'])

    const result = parser.parse(
      'u UU N... 100644 100644 100644 100644 aaa bbb ccc conflict.txt\n',
    )

    expect(result).toEqual({
      changes: [
        { path: 'conflict.txt', index: 'unmerged', worktree: 'unmerged' },
      ],
    })
  })

  it('when output has branch headers, skips them', () => {
    const parser = new GitStatusPorcelainParser(['--porcelain=v2', '-b'])

    const result = parser.parse(
      '# branch.oid abc\n# branch.head main\n? untracked.txt\n',
    )

    expect(result).toEqual({
      changes: [
        { path: 'untracked.txt', index: 'untracked', worktree: 'untracked' },
      ],
    })
  })

  it('when output is empty, returns no changes', () => {
    const parser = new GitStatusPorcelainParser(['--porcelain=v2'])

    const result = parser.parse('')

    expect(result).toEqual({ changes: [] })
  })
})
