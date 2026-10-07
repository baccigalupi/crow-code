import type { ApplicationOperationArguments } from '../../../types.ts'
import type { GitFileDiff } from '../../types.ts'
import { OperationWithResult } from '../../../operation.ts'
import { gitTrackedChanges } from './tracked-changes.ts'
import { gitUntrackedChanges } from './untracked-changes.ts'

type TaskArguments = {
  filter?: string[]
}

type GitChangesArguments = ApplicationOperationArguments<TaskArguments>

type OptionalGitChangesArguments = Pick<
  GitChangesArguments,
  'applicationData'
>

export class GitChanges
  extends OperationWithResult<TaskArguments, GitFileDiff[]> {
  protected override logPrefix = 'Git changes: '

  async run() {
    await this.runSubOperation(this.trackedChanges())
    await this.runSubOperation(this.untrackedChanges())
    return this
  }

  result() {
    return this.subResults<GitFileDiff[]>().flat()
  }

  private trackedChanges() {
    return gitTrackedChanges({
      applicationData: this.applicationData,
      operationArguments: this.operationArguments,
    })
  }

  private untrackedChanges() {
    return gitUntrackedChanges({
      applicationData: this.applicationData,
      operationArguments: this.operationArguments,
    })
  }
}

export const gitChanges = (
  args: GitChangesArguments | OptionalGitChangesArguments,
) => {
  const classArguments = { operationArguments: {}, ...args }
  return new GitChanges(classArguments)
}
