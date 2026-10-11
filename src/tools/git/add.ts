import type { ApplicationOperationArguments } from '../../types.ts'
import { GitExec } from './git-exec.ts'

type TaskArguments = {
  paths?: string[]
}

type GitAddArguments = ApplicationOperationArguments<TaskArguments>

type OptionalGitAddArguments = Pick<GitAddArguments, 'applicationData'>

export class GitAdd extends GitExec<TaskArguments, string> {
  protected override logPrefix = 'Git add: '

  executableOptions() {
    if (!this.operationArguments.paths) return { args: ['add', '--all'] }

    return { args: ['add', '--', ...this.operationArguments.paths] }
  }

  protected requestedPaths() {
    if (!this.operationArguments.paths) return []
    return this.operationArguments.paths
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
