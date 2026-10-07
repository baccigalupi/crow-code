import type { AsyncTaskArgument } from '../../../types.ts'
import { ExecCommand } from '../../exec-command.ts'
import type { GitFileDiff } from '../../types.ts'
import { trackedChangeParser } from './tracked-changes/parser.ts'

type TaskArguments = {
  filter?: string[]
}

type GitTrackedChangesArguments = AsyncTaskArgument<TaskArguments>

type OptionalGitTrackedChangesArguments = Pick<
  GitTrackedChangesArguments,
  'applicationData'
>

export class GitTrackedChanges
  extends ExecCommand<TaskArguments, GitFileDiff[]> {
  executable = 'git'

  executableOptions() {
    if (!this.taskArguments.filter) return { args: ['diff', 'HEAD'] }

    return { args: ['diff', 'HEAD', '--', ...this.taskArguments.filter] }
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
  const classArguments = { taskArguments: {}, ...args }
  return new GitTrackedChanges(classArguments)
}
