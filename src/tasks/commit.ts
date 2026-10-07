import type { CommitMessage } from '../model-requests/types.ts'
import type { GitFileDiff } from '../tools/types.ts'
import type { ApplicationOperationArguments } from '../types.ts'
import { gitChanges } from '../tools/git/diff/changes.ts'
import { commitMessage } from './commit/message.ts'
import { stageAndCommit } from './commit/stage.ts'
import { OperationWithResult } from '../operation.ts'

type TaskArguments = {
  goal: string
  files: string[]
}

type CommitArguments = ApplicationOperationArguments<TaskArguments>

export class Commit extends OperationWithResult<TaskArguments, CommitMessage> {
  protected override logPrefix = 'Task error'
  private changes: GitFileDiff[] = []
  private message: CommitMessage = { subject: '', body: '' }

  protected async runOperation() {
    await this.collectChanges()
    await this.generateMessage()
    await this.commitFiles()
  }

  result() {
    return this.message
  }

  private async collectChanges() {
    const collected = await this.runSubOperation(this.collect().run())
    this.changes = collected.result()
    if (collected.success()) this.hasChanges()
  }

  private collect() {
    return gitChanges({
      applicationData: this.applicationData,
      operationArguments: { filter: this.files() },
    })
  }

  private files() {
    if (this.operationArguments.files.length === 0) return
    return this.operationArguments.files
  }

  private hasChanges() {
    const missing = this.changes.length === 0
    if (missing) this.fail('no changes to commit')
    return !missing
  }

  private async generateMessage() {
    if (!this.succeeded) return
    const message = await commitMessage(this.messageArguments())
    if (message !== undefined) this.message = message
    if (message === undefined) this.fail('failed to generate a commit message')
  }

  private messageArguments() {
    return {
      applicationData: this.applicationData,
      operationArguments: {
        goal: this.operationArguments.goal,
        changes: this.changes,
      },
    }
  }

  private async commitFiles() {
    if (!this.succeeded) return
    await this.runSubOperation(stageAndCommit(this.stageArguments()).run())
  }

  private fullMessage() {
    return `${this.message.subject}\n\n${this.message.body}`
  }

  private stageArguments() {
    return {
      applicationData: this.applicationData,
      operationArguments: { files: this.files(), message: this.fullMessage() },
    }
  }
}

export const commit = (args: CommitArguments) => {
  return new Commit(args)
}
