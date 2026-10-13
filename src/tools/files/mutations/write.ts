import { dirname } from '@std/path'
import type { ApplicationOperationArguments } from '../../../types.ts'
import type { WriteResult } from '../../types.ts'
import { FileOperation } from '../file-operation.ts'
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
    await this.write()
  }

  private async ensureParentDirectory() {
    await this.runSubOperation(makeDirectory({
      applicationData: this.applicationData,
      operationArguments: {
        path: dirname(this.operationArguments.path),
      },
    }))
  }

  private async write() {
    if (!this.succeeded) return

    const existed = await this.exists()
    await Deno.writeTextFile(
      this.operationArguments.path,
      this.operationArguments.content,
    )
    this.created = !existed
  }

  private async exists() {
    try {
      return (await Deno.stat(this.operationArguments.path)).isFile
    } catch {
      return false
    }
  }
}

export const writeFile = (args: WriteFileArguments) => {
  return new WriteFile(args)
}
