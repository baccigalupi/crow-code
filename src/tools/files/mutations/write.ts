import { dirname } from '@std/path'
import type { ApplicationOperationArguments } from '../../../types.ts'
import type { WriteResult } from '../../types.ts'
import { FileOperation } from '../file-operation.ts'
import { type PathExists, pathExists } from '../read-only/exists.ts'
import { makeDirectory } from './mkdir.ts'

type TaskArguments = {
  path: string
  content: string
}

type WriteFileArguments = ApplicationOperationArguments<TaskArguments>

export class WriteFile extends FileOperation<TaskArguments, WriteResult> {
  protected override logPrefix = 'Write file: '
  private created = false

  result() {
    return {
      path: this.operationArguments.path,
      created: this.created,
    }
  }

  protected override async perform() {
    await this.ensureParentDirectory()
    await this.save(await this.existing())
  }

  private async ensureParentDirectory() {
    await this.runSubOperation(makeDirectory({
      applicationData: this.applicationData,
      operationArguments: {
        path: dirname(this.operationArguments.path),
      },
    }))
  }

  private existing() {
    return this.runSubOperation(pathExists({
      applicationData: this.applicationData,
      operationArguments: { path: this.operationArguments.path },
    }))
  }

  private async save(existing: PathExists) {
    if (!this.succeeded) return

    await this.applicationData.runtime.writeTextFile(
      this.operationArguments.path,
      this.operationArguments.content,
    )
    this.created = !existing.result().exists
  }
}

export const writeFile = (args: WriteFileArguments) => {
  return new WriteFile(args)
}
