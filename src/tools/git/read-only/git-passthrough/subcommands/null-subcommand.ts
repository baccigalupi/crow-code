import type { GitSubcommandClass } from '../../../../types.ts'
import { GitSubcommand } from '../git-subcommand.ts'

export const nullSubcommand = (
  requested: string,
  reason: string,
): GitSubcommandClass =>
  class NullSubcommand extends GitSubcommand {
    protected override logPrefix = `Git ${requested}: `
    readonly name = requested
    readonly flags = {}

    override refusal() {
      return reason
    }
  }
