import type { ApplicationData } from '../../types.ts'
import { ExecCommand } from '../exec-command.ts'

type CommandArguments = {
  filter?: string[]
}

type GitNewChangesArguments = {
  applicationData: ApplicationData
  commandArguments: CommandArguments
}

type OptionalGitNewChangesArguments = Pick<
  GitNewChangesArguments,
  'applicationData'
>

export class GitNewChanges extends ExecCommand<CommandArguments, string[]> {
  executable = 'git'

  executableOptions() {
    return { args: [] }
  }

  parse() {
    return []
  }

  emptyResult() {
    return []
  }

  errorPrefix() {
    return 'Git error:'
  }
}

export const gitNewChanges = (
  args: GitNewChangesArguments | OptionalGitNewChangesArguments,
) => {
  const classArguments = { commandArguments: {}, ...args }
  return new GitNewChanges(classArguments)
}
