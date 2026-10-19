import type { ApplicationOperationArguments } from '../../../types.ts'
import type {
  EditInstruction,
  MultiEditResult,
  SnapshotEntry,
} from '../../types.ts'
import { OperationWithResult } from '../../../operation.ts'
import { type EditFile, editFile } from './edit.ts'
import { takeSnapshot } from './multi-edit/take-snapshot.ts'
import { restoreSnapshot } from './multi-edit/restore-snapshot.ts'

type TaskArguments = {
  edits: EditInstruction[]
}

type MultiEditArguments = ApplicationOperationArguments<TaskArguments>

export class MultiEdit
  extends OperationWithResult<TaskArguments, MultiEditResult> {
  protected override logPrefix = 'Multi edit: '
  private entries: SnapshotEntry[] = []
  private edits: EditFile[] = []

  async run() {
    await this.checkPermissions()
    await this.snapshot()
    await this.applyEdits()
    await this.restoreIfFailed()
    return this
  }

  result(): MultiEditResult {
    if (!this.succeeded) return []

    return this.edits.map((edit) => edit.result())
  }

  private async checkPermissions() {
    const permissions = this.applicationData.writePathPermissions()
    const forbidden = await permissions.forbiddenPaths(this.paths())
    if (forbidden.length > 0) {
      this.fail(`path not allowed: ${forbidden.join(', ')}`)
    }
  }

  private paths() {
    const { edits } = this.operationArguments
    return [...new Set(edits.map((edit) => edit.path))]
  }

  private async snapshot() {
    const taken = await this.runSubOperation(takeSnapshot({
      applicationData: this.applicationData,
      operationArguments: { paths: this.paths() },
    }))
    this.entries = taken.result()
  }

  private applyEdits() {
    return this.operationArguments.edits.reduce(
      (done, edit) => done.then(() => this.applyEdit(edit)),
      Promise.resolve(),
    )
  }

  private async applyEdit(edit: EditInstruction) {
    this.edits.push(
      await this.runSubOperation(editFile({
        applicationData: this.applicationData,
        operationArguments: edit,
      })),
    )
  }

  private async restoreIfFailed() {
    if (this.succeeded) return

    const restore = await this.runNonBlockingOperation(restoreSnapshot({
      applicationData: this.applicationData,
      operationArguments: { entries: this.entries },
    }))
    if (!restore.success()) this.fail(`${this.reason}; ${restore.reason}`)
  }
}

export const multiEdit = (args: MultiEditArguments) => {
  return new MultiEdit(args)
}
