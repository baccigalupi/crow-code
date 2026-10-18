import type { Runtime } from '../runtime.ts'
import type {
  AsyncOperationWithResult,
  CommandOutput,
  Logger,
} from '../../types.ts'

type GitRepositoryRootArguments = {
  runtime: Runtime
  logger: Logger
}

export class GitRepositoryRoot implements AsyncOperationWithResult<string> {
  private logPrefix = 'Git repository root: '
  private runtime: Runtime
  private logger: Logger
  private responseText = ''
  private succeeded = true
  reason = ''

  constructor({ runtime, logger }: GitRepositoryRootArguments) {
    this.runtime = runtime
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
    return this.runtime.command('git', {
      args: ['rev-parse', '--show-toplevel'],
    })
  }

  private handleResponse(output: CommandOutput) {
    if (output.success) {
      this.responseText = output.stdout
    } else {
      this.fail(output.stderr)
    }
  }

  success() {
    return this.succeeded
  }

  result() {
    return this.responseText.trim() || this.runtime.cwd
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
