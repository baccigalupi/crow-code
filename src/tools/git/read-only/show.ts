import type { ApplicationOperationArguments } from '../../../types.ts'
import { GitExec } from '../git-exec.ts'
import { trackedChangeParser } from './diff/tracked-changes/parser.ts'
import type { FileContent, GitFileDiff } from '../../types.ts'

type TaskArguments = {
  rev?: string
  path?: string
}

type GitShowArguments = ApplicationOperationArguments<TaskArguments>

export class GitShow extends GitExec<
  TaskArguments,
  FileContent | GitFileDiff[]
> {
  protected override logPrefix = 'Git show: '

  executableOptions() {
    return { args: ['show', this.target()] }
  }

  private target() {
    if (this.operationArguments.path === undefined) return this.rev()
    return `${this.rev()}:${this.operationArguments.path}`
  }

  private rev() {
    return this.operationArguments.rev || 'HEAD'
  }

  protected requestedPaths() {
    if (this.operationArguments.path === undefined) return []
    return [this.operationArguments.path]
  }

  parse() {
    if (this.operationArguments.path === undefined) {
      return trackedChangeParser(this.responseText)
    }
    return { path: this.operationArguments.path, text: this.responseText }
  }

  emptyResult(): FileContent | GitFileDiff[] {
    if (this.operationArguments.path === undefined) return []
    return { path: this.operationArguments.path, text: '' }
  }
}

export const gitShow = (args: GitShowArguments) => {
  return new GitShow(args)
}
