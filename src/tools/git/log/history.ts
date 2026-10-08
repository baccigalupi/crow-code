import type { ApplicationOperationArguments } from '../../../types.ts'
import { ExecCli } from '../../exec-cli.ts'
import { gitPathsGuard } from '../paths-guard.ts'
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

export class GitLogHistory extends ExecCli<TaskArguments, GitLogEntry[]> {
  executable = 'git'
  protected override logPrefix = 'Git log history: '
  private pathsGuard = gitPathsGuard({ applicationData: this.applicationData })

  protected override async allowedToRun() {
    if (await this.pathsGuard.allowed(this.requestedPaths())) return true
    this.fail(`path not allowed: ${this.requestedPaths().join(', ')}`)
    return false
  }

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

  private requestedPaths() {
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
