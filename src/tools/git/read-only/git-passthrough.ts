import { OperationWithResult } from '../../../operation.ts'
import type { CommandOutput } from '../../../types.ts'
import type { GitOutput, GitSubcommand } from '../../types.ts'
import { GitReadOnlyRules } from './git-passthrough/git-passthrough-rules.ts'
import {
  gitSafeReadEnv,
  gitSafeReadSubcommand,
} from './git-passthrough/git-safe-read.ts'

type TaskArguments = {
  args: string[]
}

export class GitReadOnlyPassthrough extends OperationWithResult<
  TaskArguments,
  GitOutput
> {
  protected override logPrefix = 'Git read only passthrough: '
  protected enabled: Record<string, GitSubcommand> = {}
  private stdout = ''

  async run() {
    const refusal = this.refusal()
    if (refusal !== '') this.fail(refusal)
    else await this.runGit()
    return this
  }

  result() {
    if (this.success()) return { stdout: this.stdout }
    return { stdout: '' }
  }

  private async runGit() {
    try {
      await this.execute()
    } catch (error) {
      this.fail((error as Error).message)
    }
  }

  private async execute() {
    const output = await this.applicationData.runtime.runCommand('git', {
      args: gitSafeReadSubcommand(this.operationArguments.args),
      env: gitSafeReadEnv(this.applicationData.runtime.env()),
    })
    this.stdout = output.stdout
    if (!output.success) this.fail(this.failureReason(output))
  }

  private failureReason(output: CommandOutput) {
    if (output.stderr !== '') return output.stderr
    return `git exited with code ${output.code}: ${this.operationArguments.args.join(' ')}`
  }

  private refusal() {
    return new GitReadOnlyRules(
      this.enabled,
      this.operationArguments.args,
    ).refusal()
  }
}
