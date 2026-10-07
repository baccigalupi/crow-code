import type { CommitMessage as CommitMessageResult } from '../../model-requests/types.ts'
import type { GitFileDiff } from '../../tools/types.ts'
import type { ApplicationOperationArguments } from '../../types.ts'
import { getCommitMessage } from '../../model-requests/commit-message.ts'
import { gitRecentSubjects } from '../../tools/git/log/recent-subjects.ts'
import { OperationWithResult } from '../../operation.ts'

type TaskArguments = {
  goal: string
  changes: GitFileDiff[]
}

type MessageArguments = ApplicationOperationArguments<TaskArguments>

export class CommitMessage
  extends OperationWithResult<TaskArguments, CommitMessageResult | undefined> {
  protected override logPrefix = 'Commit message: '
  private message?: CommitMessageResult

  async run() {
    const logged = await this.recentSubjects().run()
    const runner = await this.runSubOperation(this.request(logged.result()))
    if (this.succeeded) this.message = runner.result()
    return this
  }

  result() {
    return this.message
  }

  private recentSubjects() {
    return gitRecentSubjects({ applicationData: this.applicationData })
  }

  private request(recentSubjects: string[]) {
    const { goal, changes } = this.operationArguments
    return getCommitMessage(this.applicationData, {
      goal,
      changes,
      recentSubjects,
    })
  }
}

export const commitMessage = (args: MessageArguments) => {
  return new CommitMessage(args)
}
