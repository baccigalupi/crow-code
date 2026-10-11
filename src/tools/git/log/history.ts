import type { ApplicationOperationArguments } from '../../../types.ts'
import { GitExec } from '../git-exec.ts'
import type { GitLogEntry } from '../../types.ts'

type TaskArguments = {
  count?: number
  filter?: string[]
}

type GitLogHistoryArguments = ApplicationOperationArguments<TaskArguments>

type OptionalGitLogHistoryArguments = Pick<
  GitLogHistoryArguments,
  'applicationData'
>

export class GitLogHistory extends GitExec<TaskArguments, GitLogEntry[]> {
  protected override logPrefix = 'Git log history: '

  executableOptions() {
    return { args: this.logArgs() }
  }

  private logArgs() {
    const count = this.operationArguments.count || 20
    const format = '--format=%H%x1f%an%x1f%aI%x1f%s'
    const args = ['log', format, '-n', String(count)]
    if (this.operationArguments.filter) {
      args.push('--', ...this.operationArguments.filter)
    }
    return args
  }

  protected requestedPaths() {
    if (!this.operationArguments.filter) return []
    return this.operationArguments.filter
  }

  parse() {
    return this.responseText
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        const [sha, author, date, subject] = line.split('\x1f')
        return { sha, author, date, subject }
      })
  }

  emptyResult() {
    return []
  }
}

export const gitLogHistory = (
  args: GitLogHistoryArguments | OptionalGitLogHistoryArguments,
) => {
  const classArguments = { operationArguments: {}, ...args }
  return new GitLogHistory(classArguments)
}
