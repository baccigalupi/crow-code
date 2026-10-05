import type { ApplicationData } from '../../../application-data.ts'
import { ExecCommand } from '../../exec-command.ts'

type CommandArguments = {
  count?: number
}

type GitRecentSubjectsArguments = {
  applicationData: ApplicationData
  commandArguments: CommandArguments
}

type OptionalGitRecentSubjectsArguments = Pick<
  GitRecentSubjectsArguments,
  'applicationData'
>

export class GitRecentSubjects extends ExecCommand<CommandArguments, string[]> {
  executable = 'git'

  executableOptions() {
    const count = this.commandArguments.count || 10
    return { args: ['log', '--format=%s', '-n', String(count)] }
  }

  parse() {
    return this.responseText
      .split('\n')
      .filter((line) => line.trim().length > 0)
  }

  emptyResult() {
    return []
  }

  errorPrefix() {
    return 'Git error:'
  }
}

export const gitRecentSubjects = (
  args: GitRecentSubjectsArguments | OptionalGitRecentSubjectsArguments,
) => {
  const classArguments = { commandArguments: {}, ...args }
  return new GitRecentSubjects(classArguments)
}
