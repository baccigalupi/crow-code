import type { ApplicationData } from '../../../types.ts'
import { ExecCommand } from '../../exec-command.ts'
import type { GitFileDiff } from '../../types.ts'

type CommandArguments = {
  path: string
}

type GitUntrackedChangeArguments = {
  applicationData: ApplicationData
  commandArguments: CommandArguments
}

export class GitUntrackedChange
  extends ExecCommand<CommandArguments, GitFileDiff> {
  executable = 'git'

  executableOptions() {
    return {
      args: ['diff', '--no-index', '/dev/null', this.commandArguments.path],
    }
  }

  parse() {
    return {
      path: this.commandArguments.path,
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
