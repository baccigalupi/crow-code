import { setupDatabase } from '../../database/setup-database.ts'
import { Command } from './command.ts'

export class Setup extends Command {
  isMatch() {
    return this.commands[0] === 'setup'
  }

  extractOptions() {
    return {}
  }

  async run() {
    await setupDatabase(this.crowDirectory, this.logger)
  }
}
