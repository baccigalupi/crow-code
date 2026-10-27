import { OperationWithResult } from '../../../operation.ts'
import type { CommandOutput } from '../../../types.ts'
import type { GitFlagKind, GitOutput } from '../../types.ts'
import { gitParsedArguments } from './cli-options/parsed-arguments.ts'
import {
  gitSafeReadEnv,
  gitSafeReadSubcommand,
} from './git-subcommands/cli-subcommand-wrapper.ts'
import { GitDeniedPaths } from './git-subcommands/denied-paths.ts'
import { GitForms } from './git-subcommands/forms.ts'

export abstract class GitSubcommand extends OperationWithResult<
  { args: string[] },
  GitOutput
> {
  abstract readonly name: string
  abstract readonly flags: Record<string, GitFlagKind>
  readonly fixedFlags: string[] = []
  readonly forms?: string[]
  protected rawResponse = ''

  async run() {
    const refusal = this.refusal() || (await this.deniedReason())
    if (refusal !== '') {
      this.fail(refusal)
    } else {
      await this.runGit()
    }
    return this
  }

  result() {
    return this.parse() || { stdout: this.rawResponse }
  }

  protected parse(): GitOutput | void {}

  gitArguments() {
    return [this.name, ...this.fixedFlags, ...this.args]
  }

  refusal() {
    return this.gitForms().refusal() || this.parsedArguments().refusal()
  }

  requestedPaths() {
    return this.parsedArguments().paths()
  }

  protected get args() {
    return this.operationArguments.args
  }

  private async runGit() {
    try {
      await this.execute()
    } catch (error) {
      this.fail((error as Error).message)
    }
  }

  private async execute() {
    const output = await this.runCommand()
    if (output.success) {
      this.rawResponse = output.stdout
    } else {
      this.fail(this.failureReason(output))
    }
  }

  protected runCommand() {
    return this.applicationData.runtime.runCommand('git', {
      args: gitSafeReadSubcommand(this.gitArguments()),
      env: gitSafeReadEnv(this.applicationData.runtime.env()),
      cwd: this.applicationData.runtime.cwd,
    })
  }

  private failureReason(output: CommandOutput) {
    if (output.stderr !== '') return output.stderr
    return `git exited with code ${output.code}: ${[this.name, ...this.args].join(' ')}`
  }

  private deniedReason() {
    const permissions = this.applicationData.gitPathPermissions()
    const paths = this.requestedPaths()
    return new GitDeniedPaths({ permissions, paths }).reason()
  }

  private gitForms() {
    const { name, forms, args } = this
    return new GitForms({ name, forms, args })
  }

  private parsedArguments() {
    const values = this.args.slice(this.gitForms().flagStart())
    return gitParsedArguments({ name: this.name, flags: this.flags, values })
  }
}
