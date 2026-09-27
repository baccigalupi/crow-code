import type { ApplicationData } from '../../types.ts'
import { ExecCommand } from '../exec-command.ts'

type CommandArguments = {
  filter?: string[]
}

type GitTrackedChangesArguments = {
  applicationData: ApplicationData
  commandArguments: CommandArguments
}

type OptionalGitTrackedChangesArguments = Pick<
  GitTrackedChangesArguments,
  'applicationData'
>

export class GitTrackedChanges extends ExecCommand<CommandArguments, string> {
  executable = 'git'

  executableOptions() {
    if (!this.commandArguments.filter) return { args: ['diff', 'HEAD'] }

    return { args: ['diff', 'HEAD', '--', ...this.commandArguments.filter] }
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

export const gitTrackedChanges = (
  args: GitTrackedChangesArguments | OptionalGitTrackedChangesArguments,
) => {
  const classArguments = { commandArguments: {}, ...args }
  return new GitTrackedChanges(classArguments)
}
