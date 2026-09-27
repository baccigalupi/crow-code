import type { ApplicationData } from '../../types.ts'
import { ExecCommand } from '../exec-command.ts'

type CommandArguments = {
  filter?: string[]
}

type GitDiffArguments = {
  applicationData: ApplicationData
  commandArguments: CommandArguments
}

type OptionalGitDiffArguments = Pick<GitDiffArguments, 'applicationData'>

export class GitDiff extends ExecCommand<CommandArguments, string> {
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

export const gitDiff = (
  args: GitDiffArguments | OptionalGitDiffArguments,
) => {
  const classArguments = { commandArguments: {}, ...args }
  return new GitDiff(classArguments)
}
