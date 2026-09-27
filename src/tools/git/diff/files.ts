import type { ApplicationData } from '../../../types.ts'
import { ExecCommand } from '../../exec-command.ts'
import { FileDiffParser } from './files/parser.ts'

type CommandArguments = {
  filter?: string[]
}

type GitDiffArguments = {
  applicationData: ApplicationData
  commandArguments: CommandArguments
}

type OptionalGitDiffArguments = Pick<GitDiffArguments, 'applicationData'>

export class GitDiffFiles extends ExecCommand<CommandArguments, string[]> {
  executable = 'git'

  executableOptions() {
    return {
      args: ['status', '--porcelain'],
    }
  }

  parse() {
    return new FileDiffParser(this.responseText).parse()
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
