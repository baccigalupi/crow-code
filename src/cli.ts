import { ApplicationData } from './application-data.ts'
import { memoize } from './decorators.ts'
import { type Command, command } from './cli/commands/command.ts'
import { AddProvider } from './cli/commands/add-provider.ts'
import { CreateModelCatalog } from './cli/commands/create-model-catalog.ts'
import { GitCommit } from './cli/commands/git-commit.ts'
import { Help } from './cli/commands/help.ts'
import { Repl } from './cli/commands/repl.ts'
import { Version } from './cli/commands/version.ts'

const commandClasses = [
  Version,
  CreateModelCatalog,
  AddProvider,
  GitCommit,
  Repl,
  Help,
]

class Cli {
  private applicationData: ApplicationData
  private quit: (exitCode: number) => void

  constructor(applicationData: ApplicationData, quit?: (exitCode: number) => void) {
    this.applicationData = applicationData
    this.quit = quit || ((exitCode) => Deno.exit(exitCode))
  }

  async run(): Promise<number> {
    const exitCode = await this.attempt()
    await this.shutdown(exitCode)
    return exitCode
  }

  private async attempt() {
    try {
      return await this.runMatched()
    } catch (error) {
      return this.logFailure(error)
    }
  }

  private async shutdown(exitCode: number) {
    await this.applicationData.close()
    this.quit(exitCode)
  }

  private async runMatched() {
    await this.matchedCommand().run()
    return this.exitCode()
  }

  private logFailure(error: unknown) {
    this.applicationData.logger().error(error)
    return 1
  }

  private exitCode() {
    if (!this.matchedCommand().success()) return 1
    return 0
  }

  @memoize
  private commands(): Command[] {
    return commandClasses.map((CommandClass) =>
      command(CommandClass, this.applicationData)
    )
  }

  @memoize
  private matchedCommand() {
    return this.commands().filter((command) => command.isMatch())[0]
  }
}

export const run = (
  applicationData: ApplicationData = new ApplicationData(),
  quit?: (exitCode: number) => void,
): Promise<number> => new Cli(applicationData, quit).run()
