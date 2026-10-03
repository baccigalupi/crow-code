import type { ApplicationData } from '../../../application-data.ts'
import { ExecCommand } from '../../exec-command.ts'
import type { GitFileDiff } from '../../types.ts'
import { trackedChangeParser } from './tracked-changes/parser.ts'

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

export class GitTrackedChanges
  extends ExecCommand<CommandArguments, GitFileDiff[]> {
  executable = 'git'

  executableOptions() {
    if (!this.commandArguments.filter) return { args: ['diff', 'HEAD'] }

    return { args: ['diff', 'HEAD', '--', ...this.commandArguments.filter] }
  }

  parse() {
    return trackedChangeParser(this.responseText)
  }

  emptyResult() {
    return []
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
