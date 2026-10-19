import type { ApplicationOperationArguments } from '../../../types.ts'
import type { DeleteResult } from '../../types.ts'
import { FileOperation } from '../file-operation.ts'

type TaskArguments = {
  path: string
}

type DeleteFileArguments = ApplicationOperationArguments<TaskArguments>

export class DeleteFile extends FileOperation<TaskArguments, DeleteResult> {
  protected override logPrefix = 'Delete file: '

  result() {
    return {
      path: this.operationArguments.path,
      deleted: this.success(),
    }
  }

  protected override async perform() {
    await this.applicationData.filesystem.remove(this.operationArguments.path)
  }
}

export const deleteFile = (args: DeleteFileArguments) => {
  return new DeleteFile(args)
}
