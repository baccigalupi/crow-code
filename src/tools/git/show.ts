import type { ApplicationOperationArguments } from '../../types.ts'
import { ExecCli } from '../exec-cli.ts'
import { gitPathsGuard } from './paths-guard.ts'
import { trackedChangeParser } from './diff/tracked-changes/parser.ts'
import type { FileContent, GitFileDiff } from '../types.ts'

type TaskArguments = {
  rev?: string
  path?: string
}

type GitShowArguments = ApplicationOperationArguments<TaskArguments>

export class GitShow
  extends ExecCli<TaskArguments, FileContent | GitFileDiff[]> {
  executable = 'git'
  protected override logPrefix = 'Git show: '

  protected override async allowedToRun() {
    if (await this.pathsGuard().allowed(this.requestedPaths())) return true
    this.fail(`path not allowed: ${this.requestedPaths().join(', ')}`)
    return false
  }

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

  private requestedPaths() {
    if (this.operationArguments.path === undefined) return []
    return [this.operationArguments.path]
  }

  private pathsGuard() {
    return gitPathsGuard({ applicationData: this.applicationData })
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
