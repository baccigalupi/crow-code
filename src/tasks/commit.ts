import type { CommitMessage } from '../model-requests/types.ts'
import type { GitFileDiff } from '../tools/types.ts'
import type { ApplicationOperationArguments, Logger } from '../types.ts'
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
  private logger: Logger
  private changes: GitFileDiff[] = []
  private message: CommitMessage = { subject: '', body: '' }

  constructor(args: CommitArguments) {
    super(args)
    this.logger = this.applicationData.logger()
  }

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
  }

  private files() {
    if (this.operationArguments.files.length === 0) return
    return this.operationArguments.files
  }

  private hasChanges() {
    const missing = this.changes.length === 0
    if (missing) this.logger.error('Task error: no changes to commit')
    return !missing
  }

  private async generateMessage() {
    if (!this.succeeded) return
    const message = await commitMessage(this.messageArguments())
    this.succeeded = message !== undefined
    if (message !== undefined) this.message = message
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
