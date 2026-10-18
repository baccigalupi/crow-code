import { parseArguments } from './arguments.ts'
import { memoize } from '../decorators.ts'
import { Environment, loadEnvironmentalVariables } from './env-vars.ts'
import { runtimeExec } from './runtime-exec.ts'
import type { CommandOptions, CommandOutput, Signal } from '../types.ts'

export class Runtime {
  private deno: typeof Deno
  private environment: Environment
  readonly cwd: string

  constructor(
    deno: typeof Deno,
    environment: Environment = new Environment(deno),
    cwd: string = deno.cwd(),
  ) {
    this.deno = deno
    this.environment = environment
    this.cwd = cwd
  }

  args() {
    return this.deno.args
  }

  command(executable: string, options: CommandOptions): Promise<CommandOutput> {
    return runtimeExec(this.deno, executable, options)
  }

  exit(code: number): never {
    return this.deno.exit(code)
  }

  addSignalListener(signal: Signal, handler: () => void) {
    this.deno.addSignalListener(signal, handler)
  }

  removeSignalListener(signal: Signal, handler: () => void) {
    this.deno.removeSignalListener(signal, handler)
  }

  writeStderr(text: string) {
    this.deno.stderr.writeSync(new TextEncoder().encode(text))
  }

  envars() {
    return this.environment
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
    return new Runtime(this.deno, environment, this.cwd)
  }

  @memoize
  parsedArguments() {
    return parseArguments(this.args())
  }
}

export const defaultRuntime = () => {
  return new Runtime(globalThis.Deno)
}
