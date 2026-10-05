import type { ApplicationData } from '../../application-data.ts'
import { ExecCommand } from '../exec-command.ts'

type CommandArguments = {
  message: string
}

type GitCommitArguments = {
  applicationData: ApplicationData
  commandArguments: CommandArguments
}

export class GitCommit extends ExecCommand<CommandArguments, string> {
  executable = 'git'

  executableOptions() {
    return { args: ['commit', '-m', this.commandArguments.message] }
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

export const gitCommit = (args: GitCommitArguments) => {
  return new GitCommit(args)
}
