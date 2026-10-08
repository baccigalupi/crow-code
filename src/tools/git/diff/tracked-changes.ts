import type { ApplicationOperationArguments } from '../../../types.ts'
import { ExecCli } from '../../exec-cli.ts'
import { gitPathsGuard } from '../paths-guard.ts'
import type { GitFileDiff } from '../../types.ts'
import { trackedChangeParser } from './tracked-changes/parser.ts'

type TaskArguments = {
  filter?: string[]
}

type GitTrackedChangesArguments = ApplicationOperationArguments<TaskArguments>

type OptionalGitTrackedChangesArguments = Pick<
  GitTrackedChangesArguments,
  'applicationData'
>

export class GitTrackedChanges extends ExecCli<TaskArguments, GitFileDiff[]> {
  executable = 'git'
  protected override logPrefix = 'Git tracked changes: '
  private pathsGuard = gitPathsGuard({ applicationData: this.applicationData })

  protected override async allowedToRun() {
    if (await this.pathsGuard.allowed(this.requestedPaths())) return true
    this.fail(`path not allowed: ${this.requestedPaths().join(', ')}`)
    return false
  }

  executableOptions() {
    if (!this.operationArguments.filter) return { args: ['diff', 'HEAD'] }

    return { args: ['diff', 'HEAD', '--', ...this.operationArguments.filter] }
  }

  private requestedPaths() {
    if (!this.operationArguments.filter) return []
    return this.operationArguments.filter
  }

  parse() {
    return trackedChangeParser(this.responseText)
  }

  emptyResult() {
    return []
  }
}

export const gitTrackedChanges = (
  args: GitTrackedChangesArguments | OptionalGitTrackedChangesArguments,
) => {
  const classArguments = { operationArguments: {}, ...args }
  return new GitTrackedChanges(classArguments)
}
