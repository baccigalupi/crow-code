import type { ApplicationData } from '../../../types.ts'
import { ExecCommand } from '../../exec-command.ts'

type CommandArguments = {
  path: string
}

type GitUntrackedChangeArguments = {
  applicationData: ApplicationData
  commandArguments: CommandArguments
}

export class GitUntrackedChange extends ExecCommand<CommandArguments, string> {
  executable = 'git'

  executableOptions() {
    return {
      args: ['diff', '--no-index', '/dev/null', this.commandArguments.path],
    }
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

  protected override isSuccessful(response: Deno.CommandOutput) {
    return response.success || response.code === 1
  }
}

export const gitUntrackedChange = (
  args: GitUntrackedChangeArguments,
) => {
  return new GitUntrackedChange(args)
}
