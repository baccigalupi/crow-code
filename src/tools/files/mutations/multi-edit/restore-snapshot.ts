import type { ApplicationOperationArguments } from '../../../../types.ts'
import type { SnapshotEntry } from '../../../types.ts'
import { Operation } from '../../../../operation.ts'

type TaskArguments = {
  entries: SnapshotEntry[]
}

type RestoreSnapshotArguments = ApplicationOperationArguments<TaskArguments>

export class RestoreSnapshot extends Operation<TaskArguments> {
  protected override logPrefix = 'Restore snapshot: '

  async run() {
    const failed = await this.restore()
    if (failed.length > 0) this.fail(`failed to restore: ${failed.join(', ')}`)
    return this
  }

  private async restore() {
    const { entries } = this.operationArguments
    const results = await Promise.all(
      entries.map(([path, text]) => this.write(path, text)),
    )
    return entries.filter((_, index) => !results[index]).map(([path]) => path)
  }

  private async write(path: string, text: string) {
    try {
      await this.applicationData.runtime.writeTextFile(path, text)
      return true
    } catch {
      return false
    }
  }
}

export const restoreSnapshot = (args: RestoreSnapshotArguments) => {
  return new RestoreSnapshot(args)
}
