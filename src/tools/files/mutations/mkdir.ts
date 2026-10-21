import type { ApplicationOperationArguments } from '../../../types.ts'
import type { MakeDirectoryResult } from '../../types.ts'
import { FileOperation } from '../file-operation.ts'
import { type PathExists, pathExists } from '../read-only/exists.ts'

type TaskArguments = {
  path: string
}

type MakeDirectoryArguments = ApplicationOperationArguments<TaskArguments>

export class MakeDirectory extends FileOperation<
  TaskArguments,
  MakeDirectoryResult
> {
  protected override logPrefix = 'Make directory: '
  private created = false

  result() {
    return {
      path: this.operationArguments.path,
      created: this.created,
    }
  }

  protected override async perform() {
    const existing = await this.runSubOperation(
      pathExists({
        applicationData: this.applicationData,
        operationArguments: { path: this.operationArguments.path },
      }),
    )
    await this.create(existing)
  }

  private async create(existing: PathExists) {
    if (!this.succeeded) return

    await this.applicationData.filesystem.mkdirWithParents(
      this.operationArguments.path,
    )
    this.created = !existing.result().exists
  }
}

export const makeDirectory = (args: MakeDirectoryArguments) => {
  return new MakeDirectory(args)
}
