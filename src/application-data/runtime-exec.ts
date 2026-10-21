import type { Command as CommandRunner, CommandOptions } from '../types.ts'

export class Command {
  private executable: string
  private options: CommandOptions

  constructor(executable: string, options: CommandOptions) {
    this.executable = executable
    this.options = options
  }

  async output() {
    const process = this.spawn()
    const [stdout, stderr, code] = await Promise.all([
      new Response(process.stdout).text(),
      new Response(process.stderr).text(),
      process.exited,
    ])
    return { success: code === 0, code, stdout, stderr }
  }

  private spawn() {
    return Bun.spawn([this.executable, ...this.options.args], {
      stdout: 'pipe',
      stderr: 'pipe',
    })
  }
}

export const runtimeExec: CommandRunner = (executable, options) => {
  return new Command(executable, options).output()
}
