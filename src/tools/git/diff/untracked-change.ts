import type { ApplicationTaskArguments } from '../../../types.ts'
import { ExecCommand } from '../../exec-command.ts'
import type { GitFileDiff } from '../../types.ts'

type TaskArguments = {
  path: string
}

type GitUntrackedChangeArguments = ApplicationTaskArguments<TaskArguments>

export class GitUntrackedChange
  extends ExecCommand<TaskArguments, GitFileDiff> {
  executable = 'git'

  executableOptions() {
    return {
      args: ['diff', '--no-index', '/dev/null', this.taskArguments.path],
    }
  }

  parse() {
    return {
      path: this.taskArguments.path,
      diff: this.responseText,
    }
  }

  emptyResult() {
    return { path: '', diff: '' }
  }

  errorPrefix() {
    return 'Git error:'
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
