import type { ApplicationOperationArguments } from '../../../types.ts'
import { ExecCli } from '../../exec-cli.ts'
import type { GitFileDiff } from '../../types.ts'
import { trackedChangeParser } from './tracked-changes/parser.ts'

type TaskArguments = {
  filter?: string[]
}

type GitTrackedChangesArguments = ApplicationOperationArguments<TaskArguments>

type OptionalGitTrackedChangesArguments = Pick<
  GitTrackedChangesArguments,
  'applicationData'
>

export class GitTrackedChanges extends ExecCli<TaskArguments, GitFileDiff[]> {
  executable = 'git'
  protected override logPrefix = 'Git tracked changes: '

  executableOptions() {
    if (!this.operationArguments.filter) return { args: ['diff', 'HEAD'] }

    return { args: ['diff', 'HEAD', '--', ...this.operationArguments.filter] }
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
