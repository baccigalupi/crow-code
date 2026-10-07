import type { ApplicationOperationArguments } from '../../types.ts'
import { ExecCli } from '../exec-cli.ts'

type TaskArguments = {
  paths?: string[]
}

type GitAddArguments = ApplicationOperationArguments<TaskArguments>

type OptionalGitAddArguments = Pick<GitAddArguments, 'applicationData'>

export class GitAdd extends ExecCli<TaskArguments, string> {
  executable = 'git'
  protected override logPrefix = 'Git error'

  executableOptions() {
    if (!this.operationArguments.paths) return { args: ['add', '--all'] }

    return { args: ['add', '--', ...this.operationArguments.paths] }
  }

  parse() {
    return this.responseText
  }

  emptyResult() {
    return ''
  }
}

export const gitAdd = (
  args: GitAddArguments | OptionalGitAddArguments,
) => {
  const classArguments = { operationArguments: {}, ...args }
  return new GitAdd(classArguments)
}
