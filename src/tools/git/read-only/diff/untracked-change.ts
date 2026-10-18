import type {
  ApplicationOperationArguments,
  CommandOutput,
} from '../../../../types.ts'
import { GitExec } from '../../git-exec.ts'
import type { GitFileDiff } from '../../../types.ts'

type TaskArguments = {
  path: string
}

type GitUntrackedChangeArguments = ApplicationOperationArguments<TaskArguments>

export class GitUntrackedChange extends GitExec<TaskArguments, GitFileDiff> {
  protected override logPrefix = 'Git untracked change: '

  executableOptions() {
    return {
      args: ['diff', '--no-index', '/dev/null', this.operationArguments.path],
    }
  }

  parse() {
    return {
      path: this.operationArguments.path,
      diff: this.responseText,
    }
  }

  emptyResult() {
    return { path: '', diff: '' }
  }

  protected requestedPaths() {
    return [this.operationArguments.path]
  }

  protected override isSuccessful(output: CommandOutput) {
    return output.success || output.code === 1
  }
}

export const gitUntrackedChange = (
  args: GitUntrackedChangeArguments,
) => {
  return new GitUntrackedChange(args)
}
