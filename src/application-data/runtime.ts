import { parseArguments } from './arguments.ts'
import { memoize } from '../decorators.ts'
import { Environment, loadEnvironmentalVariables } from './env-vars.ts'

export class Runtime {
  private deno: typeof Deno
  private environment: Environment
  private directory: string

  constructor(
    deno: typeof Deno,
    environment: Environment = new Environment(deno),
    directory: string = deno.cwd(),
  ) {
    this.deno = deno
    this.environment = environment
    this.directory = directory
  }

  args() {
    return this.deno.args
  }

  denoCommand() {
    return this.deno.Command
  }

  envars() {
    return this.environment
  }

  cwd() {
    return this.directory
  }

  readTextFile(path: string) {
    return this.deno.readTextFile(path)
  }

  writeTextFile(path: string, text: string) {
    return this.deno.writeTextFile(path, text)
  }

  mkdir(path: string) {
    return this.deno.mkdir(path, { recursive: true })
  }

  rename(from: string, to: string) {
    return this.deno.rename(from, to)
  }

  remove(path: string) {
    return this.deno.remove(path)
  }

  async lstat(path: string) {
    await this.deno.lstat(path)
  }

  realPath(path: string) {
    return this.deno.realPath(path)
  }

  isNotFound(error: unknown) {
    return error instanceof this.deno.errors.NotFound
  }

  async withEnvironmentFile(path: string) {
    const environment = await loadEnvironmentalVariables(path, this.deno)
    return new Runtime(this.deno, environment, this.directory)
  }

  @memoize
  parsedArguments() {
    return parseArguments(this.args())
  }
}

export const defaultRuntime = () => {
  return new Runtime(globalThis.Deno)
}
