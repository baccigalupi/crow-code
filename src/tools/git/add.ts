import type { ApplicationData } from '../../application-data.ts'
import { ExecCommand } from '../exec-command.ts'

type CommandArguments = {
  paths: string[]
}

type GitAddArguments = {
  applicationData: ApplicationData
  commandArguments: CommandArguments
}

export class GitAdd extends ExecCommand<CommandArguments, string> {
  executable = 'git'

  executableOptions() {
    return { args: ['add', '--', ...this.commandArguments.paths] }
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

export const gitAdd = (args: GitAddArguments) => {
  return new GitAdd(args)
}
