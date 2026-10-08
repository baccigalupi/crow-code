import type { ApplicationOperationArguments } from '../../types.ts'
import { ExecCli } from '../exec-cli.ts'

type TaskArguments = Record<string, never>

type GitRepositoryRootArguments = Pick<
  ApplicationOperationArguments<TaskArguments>,
  'applicationData'
>

export class GitRepositoryRoot extends ExecCli<TaskArguments, string> {
  executable = 'git'
  protected override logPrefix = 'Git repository root: '

  executableOptions() {
    return { args: ['rev-parse', '--show-toplevel'] }
  }

  parse() {
    return this.responseText.trim() || Deno.cwd()
  }

  emptyResult() {
    return Deno.cwd()
  }
}

export const gitRepositoryRoot = (args: GitRepositoryRootArguments) => {
  return new GitRepositoryRoot({ operationArguments: {}, ...args })
}
