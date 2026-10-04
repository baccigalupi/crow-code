import type { ApplicationData } from './application-data.ts'
import type { Command } from './cli/commands/command.ts'
import { AddProvider } from './cli/commands/add-provider.ts'
import { CreateModelCatalog } from './cli/commands/create-model-catalog.ts'
import { Help } from './cli/commands/help.ts'
import { Repl } from './cli/commands/repl.ts'
import { Version } from './cli/commands/version.ts'

class Cli {
  private applicationData: ApplicationData

  constructor(applicationData: ApplicationData) {
    this.applicationData = applicationData
  }

  async run() {
    try {
      await this.matchedCommand().run()
    } finally {
      await this.applicationData.close()
    }
  }

  private commands(): Command[] {
    return [
      new Version(this.applicationData),
      new CreateModelCatalog(this.applicationData),
      new AddProvider(this.applicationData),
      new Repl(this.applicationData),
      new Help(this.applicationData),
    ]
  }

  private matchedCommand() {
    return this.commands().filter((command) => command.isMatch())[0]
  }
}

export const run = (applicationData: ApplicationData): Promise<void> =>
  new Cli(applicationData).run()
