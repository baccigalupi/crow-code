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
  protected override logPrefix = 'Stage and commit: '

  async run() {
    await this.addFiles()
    await this.commitFiles()
    return this
  }

  private async addFiles() {
    await this.runSubOperation(this.add())
  }

  private add() {
    return gitAdd({
      applicationData: this.applicationData,
      operationArguments: { paths: this.operationArguments.files },
    })
  }

  private async commitFiles() {
    await this.runSubOperation(this.commit())
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
