import { OperationWithResult } from '../../../operation.ts'
import type { CommandOutput } from '../../../types.ts'
import type { GitOutput } from '../../types.ts'
import type { GitSubcommand } from './git-passthrough/git-subcommand.ts'
import { GitSubcommands } from './git-passthrough/git-subcommands.ts'
import {
  gitSafeReadEnv,
  gitSafeReadSubcommand,
} from './git-passthrough/cli-subcommand-wrapper.ts'

type TaskArguments = {
  args: string[]
}

export class GitReadOnlyPassthrough extends OperationWithResult<
  TaskArguments,
  GitOutput
> {
  protected override logPrefix = 'Git read only passthrough: '
  private subcommands = new GitSubcommands()
  private stdout = ''

  async run() {
    const [name = '', ...args] = this.operationArguments.args
    const Subcommand = this.subcommands.classFor(name)
    await this.runSubcommand(new Subcommand({ args }))
    return this
  }

  result() {
    if (this.success()) return { stdout: this.stdout }
    return { stdout: '' }
  }

  private async runSubcommand(subcommand: GitSubcommand) {
    const refusal =
      subcommand.refusal() || (await this.deniedReason(subcommand))
    if (refusal !== '') this.fail(refusal)
    else await this.runGit(subcommand)
  }

  private async runGit(subcommand: GitSubcommand) {
    try {
      await this.execute(subcommand)
    } catch (error) {
      this.fail((error as Error).message)
    }
  }

  private async execute(subcommand: GitSubcommand) {
    const output = await this.applicationData.runtime.runCommand('git', {
      args: gitSafeReadSubcommand(subcommand.gitArguments()),
      env: gitSafeReadEnv(this.applicationData.runtime.env()),
      cwd: this.applicationData.runtime.cwd,
    })
    this.stdout = output.stdout
    if (!output.success) this.fail(this.failureReason(output))
  }

  private failureReason(output: CommandOutput) {
    if (output.stderr !== '') return output.stderr
    return `git exited with code ${output.code}: ${this.operationArguments.args.join(' ')}`
  }

  private async deniedReason(subcommand: GitSubcommand) {
    const denied = await this.deniedPaths(subcommand.requestedPaths())
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
}
