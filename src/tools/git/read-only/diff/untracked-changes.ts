import type { ApplicationOperationArguments } from '../../../../types.ts'
import { OperationWithResult } from '../../../../operation.ts'
import { gitDiffFiles } from './files.ts'
import type { ChangedFile, GitFileDiff } from '../../../types.ts'
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

export class GitUntrackedChanges extends OperationWithResult<
  TaskArguments,
  GitFileDiff[]
> {
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
    const files = await this.runSubOperation(this.diffFiles())
    this.untrackedFiles = this.filterUntracked(files.result())
  }

  private diffFiles() {
    return gitDiffFiles({
      applicationData: this.applicationData,
      operationArguments: this.operationArguments,
    })
  }

  private filterUntracked(files: ChangedFile[]) {
    return files.filter((file) => file.changeType === '??')
  }

  private async getUntrackedChanges() {
    if (!this.succeeded) return

    await this.untrackedFiles.reduce(async (previous, file) => {
      await previous
      const change = this.untrackedChange(file.path)
      this.untrackedChanges.push(await this.runNonBlockingOperation(change))
    }, Promise.resolve())
    this.failFromSubOperations()
  }

  private untrackedChange(path: string) {
    return gitUntrackedChange({
      applicationData: this.applicationData,
      operationArguments: { path },
    })
  }
}

export const gitUntrackedChanges = (
  args: GitUntrackedChangesArguments | OptionalGitUntrackedChangesArguments,
) => {
  const classArguments = { operationArguments: {}, ...args }
  return new GitUntrackedChanges(classArguments)
}
