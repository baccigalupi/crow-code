import type { ApplicationTaskArguments } from '../../../types.ts'
import { ExecCommand } from '../../exec-command.ts'
import { FileDiffParser } from './files/parser.ts'
import type { ChangedFile } from '../../types.ts'

type TaskArguments = {
  filter?: string[]
}

type GitDiffArguments = ApplicationTaskArguments<TaskArguments>

type OptionalGitDiffArguments = Pick<GitDiffArguments, 'applicationData'>

export class GitDiffFiles extends ExecCommand<TaskArguments, ChangedFile[]> {
  executable = 'git'

  executableOptions() {
    return {
      args: ['status', '--porcelain', '-uall'],
    }
  }

  parse() {
    return new FileDiffParser(
      this.responseText,
      this.taskArguments.filter,
    ).parse()
  }

  emptyResult() {
    return []
  }

  errorPrefix() {
    return 'Git error:'
  }
}

export const gitDiffFiles = (
  args: GitDiffArguments | OptionalGitDiffArguments,
) => {
  const classArguments = { taskArguments: {}, ...args }
  return new GitDiffFiles(classArguments)
}
