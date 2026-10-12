import { parseArguments } from './arguments.ts'
import { memoize } from '../decorators.ts'
import { loadEnvironmentalVariables } from './env-vars.ts'

export class DenoRuntime {
  private deno: typeof Deno

  constructor(deno: typeof Deno) {
    this.deno = deno
  }

  args() {
    return this.deno.args
  }

  denoCommand() {
    return this.deno.Command
  }

  getRealPath() {
    return this.deno.realPath
  }

  @memoize
  parsedArguments() {
    return parseArguments(this.args())
  }

  @memoize
  envars() {
    return loadEnvironmentalVariables()
  }
}
