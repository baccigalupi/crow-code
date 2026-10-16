import { parseArguments } from './arguments.ts'
import { memoize } from '../decorators.ts'
import { Environment, loadEnvironmentalVariables } from './env-vars.ts'
import type { CommandOptions, CommandOutput, Signal } from '../types.ts'

const decode = (bytes: Uint8Array) => new TextDecoder().decode(bytes)

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

  async command(
    executable: string,
    options: CommandOptions,
  ): Promise<CommandOutput> {
    const output = await new this.deno.Command(executable, options).output()
    return {
      success: output.success,
      code: output.code,
      stdout: decode(output.stdout),
      stderr: decode(output.stderr),
    }
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
