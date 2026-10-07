import type { ApplicationTaskArguments } from '../../../types.ts'
import { ExecCommand } from '../../exec-command.ts'

type TaskArguments = {
  count?: number
}

type GitRecentSubjectsArguments = ApplicationTaskArguments<TaskArguments>

type OptionalGitRecentSubjectsArguments = Pick<
  GitRecentSubjectsArguments,
  'applicationData'
>

export class GitRecentSubjects extends ExecCommand<TaskArguments, string[]> {
  executable = 'git'

  executableOptions() {
    const count = this.taskArguments.count || 10
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
  const classArguments = { taskArguments: {}, ...args }
  return new GitRecentSubjects(classArguments)
}
