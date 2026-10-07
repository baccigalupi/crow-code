import type { ApplicationData } from '../../../application-data.ts'
import type { ApplicationTaskArguments } from '../../../types.ts'
import type { GitFileDiff } from '../../types.ts'
import { gitTrackedChanges } from './tracked-changes.ts'
import { gitUntrackedChanges } from './untracked-changes.ts'

type TaskArguments = {
  filter?: string[]
}

type GitChangesArguments = ApplicationTaskArguments<TaskArguments>

type OptionalGitChangesArguments = Pick<
  GitChangesArguments,
  'applicationData'
>

export class GitChanges {
  applicationData: ApplicationData
  taskArguments: TaskArguments
  private changes: GitFileDiff[] = []
  private succeeded = false

  constructor(
    { applicationData, taskArguments }: GitChangesArguments,
  ) {
    this.applicationData = applicationData
    this.taskArguments = taskArguments
  }

  success() {
    return this.succeeded
  }

  async run() {
    const tracked = await this.trackedChanges().run()
    const untracked = await this.untrackedChanges().run()
    this.changes = [...tracked.result(), ...untracked.result()]
    this.succeeded = tracked.success() && untracked.success()
    return this
  }

  result() {
    return this.changes
  }

  private trackedChanges() {
    return gitTrackedChanges({
      applicationData: this.applicationData,
      taskArguments: this.taskArguments,
    })
  }

  private untrackedChanges() {
    return gitUntrackedChanges({
      applicationData: this.applicationData,
      taskArguments: this.taskArguments,
    })
  }
}

export const gitChanges = (
  args: GitChangesArguments | OptionalGitChangesArguments,
) => {
  const classArguments = { taskArguments: {}, ...args }
  return new GitChanges(classArguments)
}
