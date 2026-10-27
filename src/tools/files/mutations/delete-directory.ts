import { resolve } from 'node:path'
import type { ApplicationOperationArguments } from '../../../types.ts'
import type { DeleteDirectoryResult } from '../../types.ts'
import { FileOperation } from '../file-operation.ts'
import { deleteEntries } from './delete-directory/delete-entries.ts'

type TaskArguments = {
  path: string
}

type DeleteDirectoryArguments = ApplicationOperationArguments<TaskArguments>

export class DeleteDirectory extends FileOperation<
  TaskArguments,
  DeleteDirectoryResult
> {
  protected override logPrefix = 'Delete directory: '
  private kept: string[] = []

  result() {
    return {
      path: this.operationArguments.path,
      deleted: this.success(),
      kept: this.kept,
    }
  }

  protected override async perform() {
    await this.checkDirectory()
    this.checkNotProtected()
    await this.removeTree()
    await this.prune()
  }

  private async checkDirectory() {
    const { path } = this.operationArguments
    if (!(await this.applicationData.filesystem.isDirectory(path))) {
      this.fail(`not a directory: ${path}`)
    }
  }

  private checkNotProtected() {
    const { path } = this.operationArguments
    if (this.succeeded && this.protectedPaths().includes(this.absolutePath())) {
      this.fail(`protected path: ${path}`)
    }
  }

  private async removeTree() {
    if (!this.succeeded || this.protectedPaths().length > 0) return

    await this.applicationData.filesystem.removeTree(
      this.operationArguments.path,
    )
  }

  private async prune() {
    if (!this.succeeded || this.protectedPaths().length === 0) return

    const entries = await this.runNonBlockingOperation(this.entries())
    this.kept = entries.result()
    await this.removeEmptied()
  }

  private entries() {
    return deleteEntries({
      applicationData: this.applicationData,
      operationArguments: this.operationArguments,
    })
  }

  private async removeEmptied() {
    if (this.kept.length > 0) {
      this.fail(`failed to delete: ${this.kept.join(', ')}`)
    } else {
      await this.applicationData.filesystem.remove(this.operationArguments.path)
    }
  }

  private protectedPaths() {
    return this.permissions().protectedPathsWithin(this.operationArguments.path)
  }

  private absolutePath() {
    return resolve(
      this.applicationData.runtime.cwd,
      this.operationArguments.path,
    )
  }
}

export const deleteDirectory = (args: DeleteDirectoryArguments) => {
  return new DeleteDirectory(args)
}
