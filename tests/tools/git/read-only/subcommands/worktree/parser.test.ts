import { describe, expect, it } from 'bun:test'
import { GitWorktreeParser } from '../../../../../../src/tools/git/read-only/subcommands/worktree/parser.ts'

describe('GitWorktreeParser', () => {
  it('when given a worktree on a branch, returns path, head and branch', () => {
    const parser = new GitWorktreeParser('/repo  7f2203f [main]\n')

    const result = parser.parse()

    expect(result).toEqual({
      worktrees: [{ path: '/repo', head: '7f2203f', branch: 'main' }],
    })
  })

  it('when given a detached worktree, returns path and head without a branch', () => {
    const parser = new GitWorktreeParser('/repo  7f2203f (detached HEAD)\n')

    const result = parser.parse()

    expect(result).toEqual({ worktrees: [{ path: '/repo', head: '7f2203f' }] })
  })
})
