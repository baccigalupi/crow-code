import type { ApplicationOperationArguments } from '../../../types.ts'
import { ExecCli } from '../../exec-cli.ts'

type TaskArguments = {
  count?: number
}

type GitRecentSubjectsArguments = ApplicationOperationArguments<TaskArguments>

type OptionalGitRecentSubjectsArguments = Pick<
  GitRecentSubjectsArguments,
  'applicationData'
>

export class GitRecentSubjects extends ExecCli<TaskArguments, string[]> {
  executable = 'git'
  protected override logPrefix = 'Git recent subjects: '

  executableOptions() {
    const count = this.operationArguments.count || 10
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
}

export const gitRecentSubjects = (
  args: GitRecentSubjectsArguments | OptionalGitRecentSubjectsArguments,
) => {
  const classArguments = { operationArguments: {}, ...args }
  return new GitRecentSubjects(classArguments)
}
