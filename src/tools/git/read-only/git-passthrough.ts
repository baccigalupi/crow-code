import { OperationWithResult } from '../../../operation.ts'
import type { CommandOutput } from '../../../types.ts'
import type { GitOutput, GitSubcommand } from '../../types.ts'
import { gitReadOnlySubcommands } from './git-passthrough/git-read-only-subcommands.ts'
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
  protected enabled: Record<string, GitSubcommand> = gitReadOnlySubcommands
  private stdout = ''

  async run() {
    const refusal = this.refusal() || (await this.deniedReason())
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

  private async deniedReason() {
    const denied = await this.deniedPaths(this.rules().requestedPaths())
    return this.deniedMessage(denied)
  }

  private deniedMessage(denied: string[]) {
    if (denied.length === 0) return ''
    return `path not allowed: ${denied.join(', ')}`
  }

  private async deniedPaths(paths: string[]) {
    const forbidden = await this.applicationData
      .gitPathPermissions()
      .forbiddenPaths(paths.filter((path) => !path.startsWith(':')))
    return paths.filter(
      (path) => path.startsWith(':') || forbidden.includes(path),
    )
  }

  private refusal() {
    return this.rules().refusal()
  }

  private rules() {
    return new GitReadOnlyRules({
      enabled: this.enabled,
      args: this.operationArguments.args,
    })
  }
}
