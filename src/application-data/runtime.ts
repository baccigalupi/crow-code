import { runtimeExec } from './runtime-exec.ts'
import type { CommandOptions, ProcessSignal } from '../types.ts'

export class Runtime {
  private process: NodeJS.Process
  readonly cwd: string

  constructor(process: NodeJS.Process, cwd: string = process.cwd()) {
    this.process = process
    this.cwd = cwd
  }

  args() {
    return this.process.argv.slice(2)
  }

  env() {
    return { ...this.process.env } as Record<string, string>
  }

  runCommand(executable: string, options: CommandOptions) {
    return runtimeExec(executable, options)
  }

  exit(code: number): never {
    return this.process.exit(code)
  }

  addSignalListener(signal: ProcessSignal, handler: () => void) {
    this.process.on(signal, handler)
  }

  removeSignalListener(signal: ProcessSignal, handler: () => void) {
    this.process.off(signal, handler)
  }
}

export const defaultRuntime = () => {
  return new Runtime(process)
}
