import { runTui } from '@ismail-elkorchi/terminal-ui'
import type { TerminalHost } from '@ismail-elkorchi/terminal-ui/host'
import { createReplApp } from './repl.ts'
import type { ReplRun, ReplStatus } from './types.ts'

export const runReplApp = async (host?: TerminalHost): Promise<ReplStatus> =>
  (await runTui(createReplApp(), { host })).status

export const createRunner = (run: ReplRun = runReplApp): Runner =>
  new Runner(run)

export class Runner {
  private readonly replRun: ReplRun

  constructor(replRun: ReplRun) {
    this.replRun = replRun
  }

  async run() {
    const status = await this.replRun()
    if (status === 'completed') Deno.exit(0)
    else Deno.exit(1)
  }
}
