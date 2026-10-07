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

  async run() {
    await this.collectChanges()
    await this.generateMessage()
    await this.commitFiles()
    return this
  }

  result() {
    return this.message
  }

  private async collectChanges() {
    const collected = await gitChanges({
      applicationData: this.applicationData,
      operationArguments: { filter: this.files() },
    }).run()
    this.changes = collected.result()
    this.succeeded = collected.success() && this.hasChanges()
    if (!collected.success()) this.fail('failed to collect changes')
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
    this.succeeded = message !== undefined
    if (message !== undefined) this.message = message
    if (!this.succeeded) this.fail('failed to generate a commit message')
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
    const staged = await stageAndCommit(this.stageArguments()).run()
    this.succeeded = staged.success()
    if (!this.succeeded) this.fail('failed to stage and commit')
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
