import type {
  ApplicationOperationArguments,
  AsyncOperation,
} from '../../../../types.ts'
import type { DeleteDirectoryResult, DeleteResult } from '../../../types.ts'
import { OperationWithResult } from '../../../../operation.ts'
import { DeleteDirectory, deleteDirectory } from '../delete-directory.ts'
import { DeleteFile, deleteFile } from '../delete.ts'

type TaskArguments = {
  path: string
}

type DeleteEntriesArguments = ApplicationOperationArguments<TaskArguments>

export class DeleteEntries extends OperationWithResult<
  TaskArguments,
  string[]
> {
  protected override logPrefix = 'Delete entries: '

  async run() {
    const entries = await this.applicationData.filesystem.directoryEntries(
      this.operationArguments.path,
    )
    await this.deleteInOrder(entries)
    return this
  }

  result() {
    return this.subOperations
      .filter((operation) => !operation.success())
      .flatMap((operation) => this.keptBy(operation))
  }

  private deleteInOrder(entries: string[]) {
    return entries.reduce(
      (previous, entry) => previous.then(() => this.deleteEntry(entry)),
      Promise.resolve(),
    )
  }

  private async deleteEntry(path: string) {
    await this.runNonBlockingOperation(await this.child(path))
  }

  private async child(path: string) {
    if (await this.applicationData.filesystem.isDirectory(path)) {
      return deleteDirectory(this.childArguments(path))
    }

    return deleteFile(this.childArguments(path))
  }

  private childArguments(path: string) {
    return {
      applicationData: this.applicationData,
      operationArguments: { path },
    }
  }

  private keptBy(operation: AsyncOperation) {
    return this.keptIn((operation as DeleteDirectory | DeleteFile).result())
  }

  private keptIn(result: DeleteDirectoryResult | DeleteResult) {
    if ('kept' in result && result.kept.length > 0) return result.kept

    return [result.path]
  }
}

export const deleteEntries = (args: DeleteEntriesArguments) => {
  return new DeleteEntries(args)
}
