import type { ApplicationOperationArguments } from '../../../types.ts'
import { ExecCli } from '../../exec-cli.ts'
import type { GitFileDiff } from '../../types.ts'

type TaskArguments = {
  path: string
}

type GitUntrackedChangeArguments = ApplicationOperationArguments<TaskArguments>

export class GitUntrackedChange extends ExecCli<TaskArguments, GitFileDiff> {
  executable = 'git'
  protected override logPrefix = 'Git untracked change: '

  executableOptions() {
    return {
      args: ['diff', '--no-index', '/dev/null', this.operationArguments.path],
    }
  }

  parse() {
    return {
      path: this.operationArguments.path,
      diff: this.responseText,
    }
  }

  emptyResult() {
    return { path: '', diff: '' }
  }

  protected override isSuccessful(response: Deno.CommandOutput) {
    return response.success || response.code === 1
  }
}

export const gitUntrackedChange = (
  args: GitUntrackedChangeArguments,
) => {
  return new GitUntrackedChange(args)
}
