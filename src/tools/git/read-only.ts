import { memoize } from '../../decorators.ts'
import { OperationWithResult } from '../../operation.ts'
import type { GitOutput } from '../types.ts'
import type { GitSubcommand } from './read-only/git-subcommand.ts'
import { GitSubcommands } from './read-only/git-subcommands.ts'

type TaskArguments = {
  args: string[]
}

export class GitReadOnly extends OperationWithResult<TaskArguments, GitOutput> {
  protected override logPrefix = 'Git read only: '
  private subcommands = new GitSubcommands()

  async run() {
    await this.subcommand().run()
    this.succeeded = this.subcommand().success()
    this.reason = this.subcommand().reason
    return this
  }

  result() {
    return this.subcommand().result()
  }

  @memoize
  private subcommand(): GitSubcommand {
    const [name = '', ...args] = this.operationArguments.args
    const Subcommand = this.subcommands.classFor(name)
    return new Subcommand({
      applicationData: this.applicationData,
      operationArguments: { args },
    })
  }
}
