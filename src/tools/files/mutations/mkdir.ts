import type { ApplicationOperationArguments } from '../../../types.ts'
import type { PathPermissions } from '../../../application-data/path-permissions.ts'
import type { MakeDirectoryResult } from '../../types.ts'
import { OperationWithResult } from '../../../operation.ts'

type TaskArguments = {
  path: string
  pathPermissions?: PathPermissions
}

type MakeDirectoryArguments = ApplicationOperationArguments<TaskArguments>

export class MakeDirectory
  extends OperationWithResult<TaskArguments, MakeDirectoryResult> {
  protected override logPrefix = 'Make directory: '
  private created = false

  async run() {
    if (await this.pathNotAllowed()) return this

    await this.makeDirectory()
    return this
  }

  result() {
    return {
      path: this.operationArguments.path,
      created: this.created,
    }
  }

  private get permissions() {
    if (this.operationArguments.pathPermissions) {
      return this.operationArguments.pathPermissions
    }
    return this.applicationData.pathPermissions()
  }

  private async pathNotAllowed() {
    const allowed = await this.permissions.allows(this.operationArguments.path)
    if (!allowed) {
      this.fail(`path not allowed: ${this.operationArguments.path}`)
    }
    return !allowed
  }

  private async makeDirectory() {
    try {
      await this.tryMake()
    } catch (error) {
      this.fail((error as Error).message)
    }
  }

  private async tryMake() {
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
