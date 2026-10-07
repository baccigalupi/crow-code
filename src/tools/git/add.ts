import type { ApplicationTaskArguments } from '../../types.ts'
import { ExecCli } from '../exec-cli.ts'

type TaskArguments = {
  paths?: string[]
}

type GitAddArguments = ApplicationTaskArguments<TaskArguments>

type OptionalGitAddArguments = Pick<GitAddArguments, 'applicationData'>

export class GitAdd extends ExecCli<TaskArguments, string> {
  executable = 'git'

  executableOptions() {
    if (!this.taskArguments.paths) return { args: ['add', '--all'] }

    return { args: ['add', '--', ...this.taskArguments.paths] }
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

export const gitAdd = (
  args: GitAddArguments | OptionalGitAddArguments,
) => {
  const classArguments = { taskArguments: {}, ...args }
  return new GitAdd(classArguments)
}
