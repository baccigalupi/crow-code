import { dirname } from 'node:path'
import type { ApplicationOperationArguments } from '../../../types.ts'
import type { MoveResult } from '../../types.ts'
import { OperationWithResult } from '../../../operation.ts'
import { pathExists } from '../read-only/exists.ts'
import { makeDirectory } from './mkdir.ts'

type TaskArguments = {
  from: string
  to: string
}

type MoveFileArguments = ApplicationOperationArguments<TaskArguments>

export class MoveFile extends OperationWithResult<TaskArguments, MoveResult> {
  protected override logPrefix = 'Move file: '

  async run() {
    await this.checkPermissions()
    await this.checkSource()
    await this.checkDestination()
    await this.ensureParentDirectory()
    await this.rename()
    return this
  }

  result(): MoveResult {
    return {
      from: this.operationArguments.from,
      to: this.operationArguments.to,
    }
  }

  private async checkPermissions() {
    const { from, to } = this.operationArguments
    const permissions = this.applicationData.writePathPermissions()
    const forbidden = await permissions.forbiddenPaths([from, to])
    if (forbidden.length > 0) {
      this.fail(`path not allowed: ${forbidden.join(', ')}`)
    }
  }

  private async checkSource() {
    const { from } = this.operationArguments
    const source = await this.exists(from)
    if (this.succeeded && !source.result().exists) {
      this.fail(`source does not exist: ${from}`)
    }
  }

  private async checkDestination() {
    const { to } = this.operationArguments
    const destination = await this.exists(to)
    if (this.succeeded && destination.result().exists) {
      this.fail(`destination already exists: ${to}`)
    }
  }

  private exists(path: string) {
    return this.runSubOperation(pathExists({
      applicationData: this.applicationData,
      operationArguments: { path },
    }))
  }

  private async ensureParentDirectory() {
    await this.runSubOperation(makeDirectory({
      applicationData: this.applicationData,
      operationArguments: { path: dirname(this.operationArguments.to) },
    }))
  }

  private async rename() {
    if (!this.succeeded) return

    try {
      const { from, to } = this.operationArguments
      await this.applicationData.filesystem.rename(from, to)
    } catch (error) {
      this.fail((error as Error).message)
    }
  }
}

export const moveFile = (args: MoveFileArguments) => {
  return new MoveFile(args)
}
