import { parseArguments } from './arguments.ts'
import { memoize } from '../decorators.ts'
import { Environment, loadEnvironmentalVariables } from './env-vars.ts'

export class DenoRuntime {
  private deno: typeof Deno
  private environment: Environment

  constructor(
    deno: typeof Deno,
    environment: Environment = new Environment(deno),
  ) {
    this.deno = deno
    this.environment = environment
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

  envars() {
    return this.environment
  }

  async withEnvironmentFile(path: string) {
    const environment = await loadEnvironmentalVariables(path, this.deno)
    return new DenoRuntime(this.deno, environment)
  }

  @memoize
  parsedArguments() {
    return parseArguments(this.args())
  }
}
