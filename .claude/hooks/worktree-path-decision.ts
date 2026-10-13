export type WorktreePathDecision = {
  decision: 'allow' | 'deny'
  reason: string
}

export const decideWorktreePath = (
  targetPath: string,
): WorktreePathDecision => {
  if (targetPath.startsWith('/')) {
    return {
      decision: 'deny',
      reason:
        'Use a repo-relative path like .claude/worktrees/<name>, not an absolute path.',
    }
  }
  if (targetPath.startsWith('~')) {
    return {
      decision: 'deny',
      reason:
        'Use a repo-relative path like .claude/worktrees/<name>, not a home-relative path.',
    }
  }
  if (targetPath.split('/').includes('..')) {
    return {
      decision: 'deny',
      reason:
        'Use a repo-relative path like .claude/worktrees/<name>, not one containing `..`.',
    }
  }
  if (!targetPath.includes('.claude/worktrees/')) {
    return {
      decision: 'deny',
      reason:
        'Use a repo-relative path like .claude/worktrees/<name> — this path is not under .claude/worktrees/.',
    }
  }
  return {
    decision: 'allow',
    reason: 'Path is repo-relative and under .claude/worktrees/.',
  }
}
