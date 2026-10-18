import type {
  ApplicationOperationArguments,
  CommandOutput,
} from '../../../../types.ts'
import { ExecCli } from '../../../exec-cli.ts'
import type { GitCompare } from '../../../types.ts'

type TaskArguments = {
  from: string
  to: string
}

type GitCompareArguments = ApplicationOperationArguments<TaskArguments>

const compareFlags = ['diff', '--no-index', '--no-color', '--no-ext-diff']

export class GitCompareDiff extends ExecCli<TaskArguments, GitCompare> {
  executable = 'git'
  protected override logPrefix = 'Git compare: '

  executableOptions() {
    const { from, to } = this.operationArguments

    return { args: [...compareFlags, '--', from, to] }
  }

  parse() {
    return { diff: this.responseText }
  }

  emptyResult() {
    return { diff: '' }
  }

  // --no-index reads files, not repository state, so read permissions apply.
  protected override async allowedToRun() {
    const { from, to } = this.operationArguments
    const allowed = await this.applicationData.readPathPermissions()
      .allowsEvery([from, to])
    if (!allowed) this.fail(`path not allowed: ${from}, ${to}`)
    return allowed
  }

  protected override isSuccessful(output: CommandOutput) {
    return output.success || (output.code === 1 && output.stderr === '')
  }
}

export const gitCompare = (args: GitCompareArguments) => {
  return new GitCompareDiff(args)
}
