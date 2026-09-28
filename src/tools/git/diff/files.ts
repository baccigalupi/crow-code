import type { ApplicationData } from '../../../types.ts'
import { ExecCommand } from '../../exec-command.ts'
import { FileDiffParser } from './files/parser.ts'
import type { ChangedFile } from '../../types.ts'

type CommandArguments = {
  filter?: string[]
}

type GitDiffArguments = {
  applicationData: ApplicationData
  commandArguments: CommandArguments
}

type OptionalGitDiffArguments = Pick<GitDiffArguments, 'applicationData'>

export class GitDiffFiles extends ExecCommand<CommandArguments, ChangedFile[]> {
  executable = 'git'

  executableOptions() {
    return {
      args: ['status', '--porcelain', '-uall'],
    }
  }

  parse() {
    return new FileDiffParser(
      this.responseText,
      this.commandArguments.filter,
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
  const classArguments = { commandArguments: {}, ...args }
  return new GitDiffFiles(classArguments)
}
