import { ExecCli } from '../exec-cli.ts'
import { gitPathsGuard } from './paths-guard.ts'

export abstract class GitExec<T extends Record<string, unknown>, U>
  extends ExecCli<T, U> {
  executable = 'git'

  protected override async allowedToRun() {
    if (await this.pathsGuard().allowed(this.requestedPaths())) return true
    this.fail(`path not allowed: ${this.requestedPaths().join(', ')}`)
    return false
  }

  protected abstract requestedPaths(): string[]

  private pathsGuard() {
    return gitPathsGuard({ applicationData: this.applicationData })
  }
}
