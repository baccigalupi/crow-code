import type { ApplicationTaskArguments } from '../../types.ts'
import { ExecCommand } from '../exec-command.ts'

type TaskArguments = {
  message: string
  paths?: string[]
}

type GitCommitArguments = ApplicationTaskArguments<TaskArguments>

export class GitCommit extends ExecCommand<TaskArguments, string> {
  executable = 'git'

  executableOptions() {
    if (!this.taskArguments.paths) return { args: this.commitArgs() }

    return {
      args: [...this.commitArgs(), '--', ...this.taskArguments.paths],
    }
  }

  private commitArgs() {
    return ['commit', '-m', this.taskArguments.message]
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
