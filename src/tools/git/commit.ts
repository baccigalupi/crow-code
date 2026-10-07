import type { ApplicationOperationArguments } from '../../types.ts'
import { ExecCli } from '../exec-cli.ts'

type TaskArguments = {
  message: string
  paths?: string[]
}

type GitCommitArguments = ApplicationOperationArguments<TaskArguments>

export class GitCommit extends ExecCli<TaskArguments, string> {
  executable = 'git'

  executableOptions() {
    if (!this.operationArguments.paths) return { args: this.commitArgs() }

    return {
      args: [...this.commitArgs(), '--', ...this.operationArguments.paths],
    }
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

  errorPrefix() {
    return 'Git error:'
  }
}

export const gitCommit = (args: GitCommitArguments) => {
  return new GitCommit(args)
}
