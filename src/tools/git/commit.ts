import type { ApplicationOperationArguments } from '../../types.ts'
import { ExecCli } from '../exec-cli.ts'
import { gitPathsGuard } from './paths-guard.ts'

type TaskArguments = {
  message: string
  paths?: string[]
}

type GitCommitArguments = ApplicationOperationArguments<TaskArguments>

export class GitCommit extends ExecCli<TaskArguments, string> {
  executable = 'git'
  protected override logPrefix = 'Git commit: '
  private pathsGuard = gitPathsGuard({ applicationData: this.applicationData })

  protected override async allowedToRun() {
    if (await this.pathsGuard.allowed(this.requestedPaths())) return true
    this.fail(`path not allowed: ${this.requestedPaths().join(', ')}`)
    return false
  }

  executableOptions() {
    if (!this.operationArguments.paths) return { args: this.commitArgs() }

    return {
      args: [...this.commitArgs(), '--', ...this.operationArguments.paths],
    }
  }

  private requestedPaths() {
    if (!this.operationArguments.paths) return []
    return this.operationArguments.paths
  }

  private commitArgs() {
    return ['commit', '-m', this.operationArguments.message]
  }

  parse() {
    return this.responseText
  }

  emptyResult() {
    return ''
  }
}

export const gitCommit = (args: GitCommitArguments) => {
  return new GitCommit(args)
}
