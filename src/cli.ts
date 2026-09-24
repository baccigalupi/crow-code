import { type Environment, loadEnvironmentalVariables } from './env-vars.ts'
import type { CommandApplicationData, ConsoleLog, Logger } from './types.ts'
import { parseArguments } from './cli/arguments.ts'
import type { Command } from './cli/commands/command.ts'
import { CreateModelCatalog } from './cli/commands/create-model-catalog.ts'
import { GitCommit } from './cli/commands/git-commit.ts'
import { Help } from './cli/commands/help.ts'
import { Setup } from './cli/commands/setup.ts'
import { Version } from './cli/commands/version.ts'

class Cli {
  private data: CommandApplicationData

  constructor(data: CommandApplicationData) {
    this.data = data
  }

  run() {
    return this.matchedCommand().run()
  }

  private commands(): Command[] {
    return [
      new Version(this.data),
      new CreateModelCatalog(this.data),
      new GitCommit(this.data),
      new Setup(this.data),
      new Help(this.data),
    ]
  }

  private matchedCommand() {
    return this.commands().filter((command) => command.isMatch())[0]
  }
}

export const run = async (
  argumentsList: string[],
  crowDirectory: string,
  logger: Logger,
  consoleLog: ConsoleLog = console.log,
  fetchClient: typeof fetch = fetch,
  denoCommand: typeof Deno.Command = Deno.Command,
  environment: Environment = loadEnvironmentalVariables(),
): Promise<void> => {
  await new Cli({
    parsedArguments: parseArguments(argumentsList),
    crowDirectory,
    logger,
    consoleLog,
    fetchClient,
    denoCommand,
    environment,
  }).run()
}
