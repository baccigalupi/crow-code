import type { ApplicationOperationArguments } from '../../types.ts'
import { GitExec } from './git-exec.ts'

type TaskArguments = {
  message: string
  paths?: string[]
}

type GitCommitArguments = ApplicationOperationArguments<TaskArguments>

export class GitCommit extends GitExec<TaskArguments, string> {
  protected override logPrefix = 'Git commit: '

  executableOptions() {
    if (!this.operationArguments.paths) return { args: this.commitArgs() }

    return {
      args: [...this.commitArgs(), '--', ...this.operationArguments.paths],
    }
  }

  protected requestedPaths() {
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
