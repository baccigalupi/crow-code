import type { ApplicationData } from '../../../application-data.ts'
import { gitDiffFiles } from './files.ts'
import type { ChangedFile } from '../../types.ts'
import {
  type GitUntrackedChange,
  gitUntrackedChange,
} from './untracked-change.ts'

type CommandArguments = {
  filter?: string[]
}

type GitUntrackedChangesArguments = {
  applicationData: ApplicationData
  commandArguments: CommandArguments
}

type OptionalGitUntrackedChangesArguments = Pick<
  GitUntrackedChangesArguments,
  'applicationData'
>

export class GitUntrackedChanges {
  applicationData: ApplicationData
  commandArguments: CommandArguments
  private untrackedFiles: ChangedFile[] = []
  private untrackedChanges: GitUntrackedChange[] = []
  private succeeded = false

  constructor(
    { applicationData, commandArguments }: GitUntrackedChangesArguments,
  ) {
    this.applicationData = applicationData
    this.commandArguments = commandArguments
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
      commandArguments: this.commandArguments,
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
      commandArguments: { path },
    }).run()
  }
}

export const gitUntrackedChanges = (
  args: GitUntrackedChangesArguments | OptionalGitUntrackedChangesArguments,
) => {
  const classArguments = { commandArguments: {}, ...args }
  return new GitUntrackedChanges(classArguments)
}
