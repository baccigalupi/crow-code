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

  protected async runOperation() {
    await this.addFiles()
    await this.commitFiles()
  }

  private async addFiles() {
    await this.runSubOperation(this.add().run())
  }

  private add() {
    return gitAdd({
      applicationData: this.applicationData,
      operationArguments: { paths: this.operationArguments.files },
    })
  }

  private async commitFiles() {
    if (!this.succeeded) return
    await this.runSubOperation(this.commit().run())
  }

  private commit() {
    return gitCommit({
      applicationData: this.applicationData,
      operationArguments: this.commitTaskArguments(),
    })
  }

  private commitTaskArguments() {
    const { message, files: paths } = this.operationArguments
    return { message, paths }
  }
}

export const stageAndCommit = (args: StageArguments) => {
  return new StageAndCommit(args)
}
