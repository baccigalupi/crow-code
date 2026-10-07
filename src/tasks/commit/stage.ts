import type { ApplicationOperationArguments } from '../../types.ts'
import { gitAdd } from '../../tools/git/add.ts'
import { gitCommit } from '../../tools/git/commit.ts'
import { Operation } from '../../operation.ts'

type TaskArguments = {
  files?: string[]
  message: string
}

type StageArguments = ApplicationOperationArguments<TaskArguments>

export class StageAndCommit extends Operation<TaskArguments> {
  protected override logPrefix = 'Task error'

  async run() {
    await this.addFiles()
    await this.commitFiles()
    return this
  }

  private async addFiles() {
    const added = await gitAdd({
      applicationData: this.applicationData,
      operationArguments: { paths: this.operationArguments.files },
    }).run()
    this.succeeded = added.success()
    if (!this.succeeded) this.fail('failed to stage files')
  }

  private async commitFiles() {
    if (!this.succeeded) return
    const committed = await gitCommit({
      applicationData: this.applicationData,
      operationArguments: this.commitTaskArguments(),
    }).run()
    this.succeeded = committed.success()
    if (!this.succeeded) this.fail('failed to commit staged files')
  }

  private commitTaskArguments() {
    const { message, files: paths } = this.operationArguments
    return { message, paths }
  }
}

export const stageAndCommit = (args: StageArguments) => {
  return new StageAndCommit(args)
}
