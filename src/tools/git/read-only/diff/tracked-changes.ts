import type { ApplicationOperationArguments } from '../../../../types.ts'
import { GitExec } from '../../git-exec.ts'
import type { GitFileDiff } from '../../../types.ts'
import { trackedChangeParser } from './tracked-changes/parser.ts'

type TaskArguments = {
  filter?: string[]
}

type GitTrackedChangesArguments = ApplicationOperationArguments<TaskArguments>

type OptionalGitTrackedChangesArguments = Pick<
  GitTrackedChangesArguments,
  'applicationData'
>

export class GitTrackedChanges extends GitExec<TaskArguments, GitFileDiff[]> {
  protected override logPrefix = 'Git tracked changes: '

  executableOptions() {
    if (!this.operationArguments.filter) return { args: ['diff', 'HEAD'] }

    return { args: ['diff', 'HEAD', '--', ...this.operationArguments.filter] }
  }

  protected requestedPaths() {
    if (!this.operationArguments.filter) return []
    return this.operationArguments.filter
  }

  parse() {
    return trackedChangeParser(this.responseText)
  }

  emptyResult() {
    return []
  }
}

export const gitTrackedChanges = (
  args: GitTrackedChangesArguments | OptionalGitTrackedChangesArguments,
) => {
  const classArguments = { operationArguments: {}, ...args }
  return new GitTrackedChanges(classArguments)
}
