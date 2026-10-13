import type { ApplicationOperationArguments } from '../../../types.ts'
import type { MakeDirectoryResult } from '../../types.ts'
import { FileOperation } from '../file-operation.ts'

type TaskArguments = {
  path: string
}

type MakeDirectoryArguments = ApplicationOperationArguments<TaskArguments>

export class MakeDirectory
  extends FileOperation<TaskArguments, MakeDirectoryResult> {
  protected override logPrefix = 'Make directory: '
  private created = false

  result() {
    return {
      path: this.operationArguments.path,
      created: this.created,
    }
  }

  protected override async perform() {
    const exists = await this.exists()
    await Deno.mkdir(this.operationArguments.path, { recursive: true })
    this.created = !exists
  }

  private async exists() {
    try {
      return (await Deno.stat(this.operationArguments.path)).isDirectory
    } catch {
      return false
    }
  }
}

export const makeDirectory = (args: MakeDirectoryArguments) => {
  return new MakeDirectory(args)
}
