import type { ApplicationTaskArguments } from '../../types.ts'
import { gitAdd } from '../../tools/git/add.ts'
import { gitCommit } from '../../tools/git/commit.ts'
import { Operation } from '../../operation.ts'

type TaskArguments = {
  files?: string[]
  message: string
}

type StageArguments = ApplicationTaskArguments<TaskArguments>

export class StageAndCommit extends Operation<TaskArguments> {
  async run() {
    await this.addFiles()
    await this.commitFiles()
    return this
  }

  private async addFiles() {
    const added = await gitAdd({
      applicationData: this.applicationData,
      taskArguments: { paths: this.taskArguments.files },
    }).run()
    this.succeeded = added.success()
  }

  private async commitFiles() {
    if (!this.succeeded) return
    const committed = await gitCommit({
      applicationData: this.applicationData,
      taskArguments: this.commitTaskArguments(),
    }).run()
    this.succeeded = committed.success()
  }

  private commitTaskArguments() {
    const { message, files: paths } = this.taskArguments
    return { message, paths }
  }
}

export const stageAndCommit = (args: StageArguments) => {
  return new StageAndCommit(args)
}
