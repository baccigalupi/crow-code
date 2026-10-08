import type { ApplicationOperationArguments } from '../../../types.ts'
import { ExecCli } from '../../exec-cli.ts'
import { gitPathsGuard } from '../paths-guard.ts'
import { FileDiffParser } from './files/parser.ts'
import type { ChangedFile } from '../../types.ts'

type TaskArguments = {
  filter?: string[]
}

type GitDiffArguments = ApplicationOperationArguments<TaskArguments>

type OptionalGitDiffArguments = Pick<GitDiffArguments, 'applicationData'>

export class GitDiffFiles extends ExecCli<TaskArguments, ChangedFile[]> {
  executable = 'git'
  protected override logPrefix = 'Git diff files: '
  private pathsGuard = gitPathsGuard({ applicationData: this.applicationData })

  protected override async allowedToRun() {
    if (await this.pathsGuard.allowed(this.requestedPaths())) return true
    this.fail(`path not allowed: ${this.requestedPaths().join(', ')}`)
    return false
  }

  executableOptions() {
    return {
      args: ['status', '--porcelain', '-uall'],
    }
  }

  private requestedPaths() {
    if (!this.operationArguments.filter) return []
    return this.operationArguments.filter
  }

  parse() {
    return new FileDiffParser(
      this.responseText,
      this.operationArguments.filter,
    ).parse()
  }

  emptyResult() {
    return []
  }
}

export const gitDiffFiles = (
  args: GitDiffArguments | OptionalGitDiffArguments,
) => {
  const classArguments = { operationArguments: {}, ...args }
  return new GitDiffFiles(classArguments)
}
