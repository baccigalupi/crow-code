import { gitOptionFlags } from '../cli-options/option-flags.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import {
  gitSafeReadEnv,
  gitSafeReadSubcommand,
} from '../git-subcommands/cli-subcommand-wrapper.ts'
import { GitMergeBaseParser } from './merge-base/parser.ts'

export class GitMergeBaseSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git merge-base: '
  readonly name = 'merge-base'
  readonly flags = {
    '--all': 'boolean',
    '--octopus': 'boolean',
    '--independent': 'boolean',
    '--is-ancestor': 'boolean',
    '--fork-point': 'boolean',
  } as const

  private exitCode = 0

  protected override async runCommand() {
    const output = await this.gitOutput()
    this.exitCode = output.code
    const success = output.success || this.isAncestorExitOne()
    return { ...output, success }
  }

  private gitOutput() {
    const { runtime } = this.applicationData
    return runtime.runCommand('git', {
      args: gitSafeReadSubcommand(this.gitArguments()),
      env: gitSafeReadEnv(runtime.env()),
      cwd: runtime.cwd,
    })
  }

  protected override parse() {
    return new GitMergeBaseParser(gitOptionFlags(this.args)).parse(
      this.rawResponse,
      this.exitCode,
    )
  }

  private isAncestorExitOne() {
    return (
      gitOptionFlags(this.args).includes('--is-ancestor') && this.exitCode === 1
    )
  }
}
