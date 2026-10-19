import { runtimeExec } from './runtime-exec.ts'
import type { CommandOptions, CommandOutput, Signal } from '../types.ts'

export class Runtime {
  private deno: typeof Deno
  readonly cwd: string

  constructor(deno: typeof Deno, cwd: string = deno.cwd()) {
    this.deno = deno
    this.cwd = cwd
  }

  args() {
    return this.deno.args
  }

  env() {
    return this.deno.env.toObject()
  }

  runCommand(
    executable: string,
    options: CommandOptions,
  ): Promise<CommandOutput> {
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
}

export const defaultRuntime = () => {
  return new Runtime(globalThis.Deno)
}
