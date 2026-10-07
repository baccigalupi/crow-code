import type { ApplicationOperationArguments } from '../../../types.ts'
import { OperationWithResult } from '../../../operation.ts'
import { gitDiffFiles } from './files.ts'
import type { ChangedFile, GitFileDiff } from '../../types.ts'
import {
  type GitUntrackedChange,
  gitUntrackedChange,
} from './untracked-change.ts'

type TaskArguments = {
  filter?: string[]
}

type GitUntrackedChangesArguments = ApplicationOperationArguments<TaskArguments>

type OptionalGitUntrackedChangesArguments = Pick<
  GitUntrackedChangesArguments,
  'applicationData'
>

export class GitUntrackedChanges
  extends OperationWithResult<TaskArguments, GitFileDiff[]> {
  protected override logPrefix = 'Git untracked changes: '
  private untrackedFiles: ChangedFile[] = []
  private untrackedChanges: GitUntrackedChange[] = []

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
      operationArguments: this.operationArguments,
    }).run()
    this.untrackedFiles = this.filterUntracked(files.result())
    if (!files.success()) this.fail(files.reason)
  }

  private filterUntracked(files: ChangedFile[]) {
    return files.filter((file) => file.changeType === '??')
  }

  private async getUntrackedChanges() {
    if (!this.succeeded) return

    this.untrackedChanges = await Promise.all(
      this.untrackedFiles.map((file) => this.getUntrackedChange(file.path)),
    )
    const failed = this.untrackedChanges.find((change) => !change.success())
    if (failed) this.fail(failed.reason)
  }

  private getUntrackedChange(path: string) {
    return gitUntrackedChange({
      applicationData: this.applicationData,
      operationArguments: { path },
    }).run()
  }
}

export const gitUntrackedChanges = (
  args: GitUntrackedChangesArguments | OptionalGitUntrackedChangesArguments,
) => {
  const classArguments = { operationArguments: {}, ...args }
  return new GitUntrackedChanges(classArguments)
}
