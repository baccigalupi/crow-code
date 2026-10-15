import type {
  AsyncOperationWithResult,
  DenoCommand,
  Logger,
} from '../../types.ts'

type GitRepositoryRootArguments = {
  denoCommand: DenoCommand
  logger: Logger
}

export class GitRepositoryRoot implements AsyncOperationWithResult<string> {
  private logPrefix = 'Git repository root: '
  private denoCommand: DenoCommand
  private logger: Logger
  private responseText = ''
  private succeeded = true
  reason = ''

  constructor({ denoCommand, logger }: GitRepositoryRootArguments) {
    this.denoCommand = denoCommand
    this.logger = logger
  }

  async run() {
    try {
      this.handleResponse(await this.output())
    } catch (error) {
      this.fail((error as Error).message)
    }
    return this
  }

  private output() {
    return new this.denoCommand(
      'git',
      { args: ['rev-parse', '--show-toplevel'] },
    ).output()
  }

  private handleResponse(response: Deno.CommandOutput) {
    if (response.success) {
      this.responseText = new TextDecoder().decode(response.stdout)
    } else {
      this.fail(new TextDecoder().decode(response.stderr))
    }
  }

  success() {
    return this.succeeded
  }

  result() {
    return this.responseText.trim() || Deno.cwd()
  }

  private fail(reason: string) {
    this.succeeded = false
    this.reason = reason
    this.logger.error(`${this.logPrefix}${reason}`)
  }
}

export const gitRepositoryRoot = (args: GitRepositoryRootArguments) => {
  return new GitRepositoryRoot(args)
}
