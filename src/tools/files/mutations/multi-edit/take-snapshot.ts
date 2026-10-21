import type { ApplicationOperationArguments } from '../../../../types.ts'
import type { SnapshotEntry } from '../../../types.ts'
import { OperationWithResult } from '../../../../operation.ts'

type TaskArguments = {
  paths: string[]
}

type TakeSnapshotArguments = ApplicationOperationArguments<TaskArguments>

export class TakeSnapshot extends OperationWithResult<
  TaskArguments,
  SnapshotEntry[]
> {
  protected override logPrefix = 'Take snapshot: '
  private entries: SnapshotEntry[] = []

  async run() {
    await this.capture().catch((error: Error) => this.fail(error.message))
    return this
  }

  result() {
    return this.entries
  }

  private async capture() {
    this.entries = await Promise.all(
      this.operationArguments.paths.map((path) => this.read(path)),
    )
  }

  private async read(path: string): Promise<SnapshotEntry> {
    return [path, await this.applicationData.filesystem.readTextFile(path)]
  }
}

export const takeSnapshot = (args: TakeSnapshotArguments) => {
  return new TakeSnapshot(args)
}
