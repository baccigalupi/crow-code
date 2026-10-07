import type { ApplicationOperationArguments } from '../../../types.ts'
import { ExecCli } from '../../exec-cli.ts'
import { FileDiffParser } from './files/parser.ts'
import type { ChangedFile } from '../../types.ts'

type TaskArguments = {
  filter?: string[]
}

type GitDiffArguments = ApplicationOperationArguments<TaskArguments>

type OptionalGitDiffArguments = Pick<GitDiffArguments, 'applicationData'>

export class GitDiffFiles extends ExecCli<TaskArguments, ChangedFile[]> {
  executable = 'git'
  protected override logPrefix = 'Git error'

  executableOptions() {
    return {
      args: ['status', '--porcelain', '-uall'],
    }
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
