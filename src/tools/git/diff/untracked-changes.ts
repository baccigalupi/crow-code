import type { ApplicationData } from '../../../application-data.ts'
import type { AsyncTaskArgument } from '../../../types.ts'
import { gitDiffFiles } from './files.ts'
import type { ChangedFile } from '../../types.ts'
import {
  type GitUntrackedChange,
  gitUntrackedChange,
} from './untracked-change.ts'

type TaskArguments = {
  filter?: string[]
}

type GitUntrackedChangesArguments = AsyncTaskArgument<TaskArguments>

type OptionalGitUntrackedChangesArguments = Pick<
  GitUntrackedChangesArguments,
  'applicationData'
>

export class GitUntrackedChanges {
  applicationData: ApplicationData
  taskArguments: TaskArguments
  private untrackedFiles: ChangedFile[] = []
  private untrackedChanges: GitUntrackedChange[] = []
  private succeeded = false

  constructor(
    { applicationData, taskArguments }: GitUntrackedChangesArguments,
  ) {
    this.applicationData = applicationData
    this.taskArguments = taskArguments
  }

  success() {
    return this.succeeded
  }

  async run() {
    await this.getChangedFiles()
    await this.getUntrackedChanges()

    return this
  }

  result() {
    return this.untrackedChanges
      .filter((change) => change.success())
      .map((change) => change.result())
  }

  private async getChangedFiles() {
    const files = await gitDiffFiles({
      applicationData: this.applicationData,
      taskArguments: this.taskArguments,
    }).run()
    this.untrackedFiles = this.filterUntracked(files.result())
    this.succeeded = files.success()
  }

  private filterUntracked(files: ChangedFile[]) {
    return files.filter((file) => file.changeType === '??')
  }

  private async getUntrackedChanges() {
    if (!this.succeeded) return

    this.untrackedChanges = await Promise.all(
      this.untrackedFiles.map((file) => this.getUntrackedChange(file.path)),
    )
    this.succeeded = this.untrackedChanges.every((change) => change.success())
  }

  private getUntrackedChange(path: string) {
    return gitUntrackedChange({
      applicationData: this.applicationData,
      taskArguments: { path },
    }).run()
  }
}

export const gitUntrackedChanges = (
  args: GitUntrackedChangesArguments | OptionalGitUntrackedChangesArguments,
) => {
  const classArguments = { taskArguments: {}, ...args }
  return new GitUntrackedChanges(classArguments)
}
