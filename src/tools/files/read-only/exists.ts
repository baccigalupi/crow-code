import type { ApplicationOperationArguments } from '../../../types.ts'
import type { PathExistsResult } from '../../types.ts'
import { ReadOnlyFileOperation } from './base-operation.ts'

type TaskArguments = {
  path: string
}

type PathExistsArguments = ApplicationOperationArguments<TaskArguments>

export class PathExists
  extends ReadOnlyFileOperation<TaskArguments, PathExistsResult> {
  protected override logPrefix = 'Path exists: '
  private found = false

  result() {
    return { path: this.operationArguments.path, exists: this.found }
  }

  protected override async perform() {
    this.found = await this.exists()
  }

  private exists() {
    const { path } = this.operationArguments
    return this.applicationData.filesystem.assertExists(path)
      .then(() => true, () => false)
  }
}

export const pathExists = (args: PathExistsArguments) => {
  return new PathExists(args)
}
