import { describe, expect, it } from 'bun:test'
import { decideWorktreePath } from '../../../.claude/hooks/worktree-path-decision.ts'

describe('decideWorktreePath', () => {
  it('when the path is absolute, denies it', () => {
    const path = '/Users/kane/elsewhere'

    const result = decideWorktreePath(path)

    expect(result.decision).toBe('deny')
    expect(result.reason).toContain('absolute path')
  })

  it('when the path is home-relative, denies it', () => {
    const path = '~/elsewhere'

    const result = decideWorktreePath(path)

    expect(result.decision).toBe('deny')
    expect(result.reason).toContain('home-relative')
  })

  it('when the path contains a traversal segment, denies it', () => {
    const path = '.claude/worktrees/../../etc'

    const result = decideWorktreePath(path)

    expect(result.decision).toBe('deny')
    expect(result.reason).toContain('..')
  })

  it('when the path is not under .claude/worktrees/, denies it', () => {
    const path = '.worktrees/foo'

    const result = decideWorktreePath(path)

    expect(result.decision).toBe('deny')
    expect(result.reason).toContain('.claude/worktrees/')
  })

  it('when the path is repo-relative and under .claude/worktrees/, allows it', () => {
    const path = '.claude/worktrees/foo'

    const result = decideWorktreePath(path)

    expect(result.decision).toBe('allow')
  })
})
