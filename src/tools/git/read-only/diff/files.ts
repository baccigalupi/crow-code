import type { ApplicationOperationArguments } from '../../../../types.ts'
import { GitExec } from '../../git-exec.ts'
import { FileDiffParser } from './files/parser.ts'
import type { ChangedFile } from '../../../types.ts'

type TaskArguments = {
  filter?: string[]
}

type GitDiffArguments = ApplicationOperationArguments<TaskArguments>

type OptionalGitDiffArguments = Pick<GitDiffArguments, 'applicationData'>

export class GitDiffFiles extends GitExec<TaskArguments, ChangedFile[]> {
  protected override logPrefix = 'Git diff files: '

  executableOptions() {
    return {
      args: ['status', '--porcelain', '-uall'],
    }
  }

  protected requestedPaths() {
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
