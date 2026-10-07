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
  protected override logPrefix = 'Commit: '
  private nullMessage: CommitMessage = { subject: '', body: '' }
  private changes: GitFileDiff[] = []
  private message: CommitMessage = this.nullMessage

  async run() {
    await this.collectGitChanges()
    await this.generateMessage()
    await this.commitFiles()
    return this
  }

  result() {
    return this.message
  }

  private async collectGitChanges() {
    const args = {
      applicationData: this.applicationData,
      operationArguments: { filter: this.files() },
    }
    const collected = await this.runSubOperation(gitChanges(args))
    this.changes = collected.result()
    this.failIfNoChanges(collected)
  }

  private failIfNoChanges(collected: ReturnType<typeof gitChanges>) {
    if (collected.success() && this.noChanges()) {
      this.fail('no changes to commit')
    }
  }

  private files() {
    if (this.operationArguments.files.length === 0) return
    return this.operationArguments.files
  }

  private noChanges() {
    return this.changes.length === 0
  }

  private async generateMessage() {
    const operationArguments = {
      goal: this.operationArguments.goal,
      changes: this.changes,
    }
    const args = { applicationData: this.applicationData, operationArguments }
    const generated = await this.runSubOperation(commitMessage(args))
    this.message = generated.result() || this.nullMessage
  }

  private async commitFiles() {
    const args = {
      applicationData: this.applicationData,
      operationArguments: { files: this.files(), message: this.fullMessage() },
    }
    await this.runSubOperation(stageAndCommit(args))
  }

  private fullMessage() {
    return `${this.message.subject}\n\n${this.message.body}`
  }
}

export const commit = (args: CommitArguments) => {
  return new Commit(args)
}
