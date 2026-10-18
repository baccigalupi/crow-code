import type { ApplicationData } from './application-data/application-data.ts'
import { buildApplicationData } from './application-data/builder.ts'
import { memoize } from './decorators.ts'
import type { Command } from './cli/commands/command.ts'
import { AddProvider } from './cli/commands/add-provider.ts'
import { CreateModelCatalog } from './cli/commands/create-model-catalog.ts'
import { GitCommit } from './cli/commands/git-commit.ts'
import { Help } from './cli/commands/help.ts'
import { Install } from './cli/commands/install.ts'
import { Repl } from './cli/commands/repl.ts'
import { Version } from './cli/commands/version.ts'

const commandClasses = [
  Version,
  CreateModelCatalog,
  AddProvider,
  GitCommit,
  Install,
  Repl,
  Help,
]

class Cli {
  private applicationData: ApplicationData

  constructor(applicationData: ApplicationData) {
    this.applicationData = applicationData
  }

  async run(): Promise<number> {
    const exitCode = await this.attempt()
    await this.applicationData.close()
    return exitCode
  }

  private async attempt() {
    try {
      return await this.runMatched()
    } catch (error) {
      return this.logFailure(error)
    }
  }

  private async runMatched() {
    const matched = this.matchedCommand()
    await matched.run()
    if (!matched.success()) matched.reportFailure()
    return this.exitCode()
  }

  private logFailure(error: unknown) {
    this.applicationData.logger().error(error)
    return 1
  }

  private exitCode() {
    return this.matchedCommand().exitCode()
  }

  @memoize
  private commands(): Command[] {
    return commandClasses.map((CommandClass) =>
      new CommandClass({
        applicationData: this.applicationData,
        operationArguments: this.applicationData.parsedArguments,
      })
    )
  }

  @memoize
  private matchedCommand() {
    return this.commands().filter((command) => command.isMatch())[0]
  }
}

export const run = async (applicationData?: ApplicationData) => {
  const data = applicationData || (await buildApplicationData().run()).result()
  const cli = new Cli(data)
  data.runtime.exit(await cli.run())
}
